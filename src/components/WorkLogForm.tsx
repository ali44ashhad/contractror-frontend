import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  CreateUpdateRequest,
  UpdateType,
  DocumentType,
  DocumentMetadataInput,
} from '../types/update.types';
import { Project, ProjectStatus } from '../types/project.types';
import Select from './Select';
import Input from './Input';

interface WorkLogFormProps {
  projects: Project[];
  onSubmit: (
    data: CreateUpdateRequest,
    files: File[],
    documentMetadata: DocumentMetadataInput[]
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FileWithMetadata {
  file: File;
  metadata: DocumentMetadataInput;
  preview?: string;
}

interface FormErrors {
  projectId?: string;
  status?: string;
  files?: string;
}

/**
 * WorkLogForm component
 * Form for creating work log updates with file uploads
 * Includes form validation, file preview, and document metadata handling
 */
const WorkLogForm = memo<WorkLogFormProps>(
  ({ projects, onSubmit, onCancel, isLoading = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    // Get today's date normalized to start of day in UTC (matching backend behavior)
    const getTodayDate = useCallback(() => {
      const today = new Date();
      // Use UTC methods to avoid timezone shifts
      const year = today.getUTCFullYear();
      const month = String(today.getUTCMonth() + 1).padStart(2, '0');
      const day = String(today.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }, []);

    // Automatically determine update type based on current time
    // Morning: before 1 PM (13:00), Evening: 1 PM onwards
    const getUpdateType = useCallback((): UpdateType => {
      const now = new Date();
      const hour = now.getHours();
      return hour < 13 ? UpdateType.MORNING : UpdateType.EVENING;
    }, []);

    const [formData, setFormData] = useState({
      projectId: '',
      status: '',
      updateDescription: '',
    });

    // Get current update type (recalculated on each render to reflect current time)
    const currentUpdateType = getUpdateType();

    const [files, setFiles] = useState<FileWithMetadata[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoadingCamera, setIsLoadingCamera] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Filter projects to only show IN_PROGRESS projects
    const availableProjects = projects.filter(
      (p) => p.status === ProjectStatus.IN_PROGRESS
    );

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.projectId) {
        newErrors.projectId = 'Project is required';
      }

      if (!formData.status.trim()) {
        newErrors.status = 'Status is required';
      }

      if (files.length === 0) {
        newErrors.files = 'At least one photo is required';
      }

      // Note: Document type is automatically set to DocumentType.OTHER for all photos

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData, files]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
          }));
        }
      },
      [errors]
    );

    // Start camera
    const startCamera = useCallback(async () => {
      try {
        setCameraError(null);
        setIsLoadingCamera(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: false,
        });
        
        streamRef.current = stream;
        
        // Set camera active immediately so UI updates
        setIsCameraActive(true);
        
        if (videoRef.current) {
          const video = videoRef.current;
          
          // Attach stream to video
          video.srcObject = stream;
          
          // Set up event listeners
          const handleLoadedMetadata = async () => {
            try {
              await video.play();
              setIsLoadingCamera(false);
            } catch (err) {
              console.error('Error playing video:', err);
              setIsLoadingCamera(false);
            }
          };
          
          const handleCanPlay = async () => {
            try {
              if (video.paused) {
                await video.play();
              }
              setIsLoadingCamera(false);
            } catch (err) {
              console.error('Error in canplay handler:', err);
            }
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          video.addEventListener('canplay', handleCanPlay, { once: true });
          video.addEventListener('playing', () => {
            setIsLoadingCamera(false);
          }, { once: true });
          
          // Try to play immediately
          try {
            await video.play();
            setIsLoadingCamera(false);
          } catch (err) {
            // If play fails, wait for metadata
            console.log('Video play() failed, waiting for metadata...', err);
          }
        } else {
          setIsLoadingCamera(false);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsLoadingCamera(false);
        setIsCameraActive(false);
        setCameraError(
          'Unable to access camera. Please ensure camera permissions are granted.'
        );
      }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
      setIsCameraActive(false);
      setIsLoadingCamera(false);
    }, []);

    // Capture photo from camera
    const capturePhoto = useCallback(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0);

      // Request geolocation before creating the file
      setIsGettingLocation(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        setIsGettingLocation(false);
        setLocationError('Geolocation is not supported by your browser. Please enable location services.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Convert canvas to blob, then to File
          canvas.toBlob((blob) => {
            if (!blob) {
              setIsGettingLocation(false);
              return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `photo-${timestamp}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            const preview = URL.createObjectURL(file);

            const newFile: FileWithMetadata = {
              file,
              metadata: {
                type: DocumentType.OTHER,
                fileName: fileName,
                latitude: latitude,
                longitude: longitude,
              },
              preview,
            };

            setFiles((prev) => [...prev, newFile]);
            setIsGettingLocation(false);
            setLocationError(null);

            // Clear file error
            if (errors.files) {
              setErrors((prev) => ({
                ...prev,
                files: undefined,
              }));
            }
          }, 'image/jpeg', 0.9);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Failed to get location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location permission was denied. Please enable location access to capture photos.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage += 'An unknown error occurred while getting location.';
              break;
          }
          
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0, // Don't use cached position
        }
      );
    }, [errors]);

    const removeFile = useCallback((index: number) => {
      setFiles((prev) => {
        const newFiles = [...prev];
        const removed = newFiles.splice(index, 1)[0];
        // Revoke preview URL to prevent memory leak
        if (removed.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        return newFiles;
      });
    }, []);

    const updateFileMetadata = useCallback(
      (index: number, field: keyof DocumentMetadataInput, value: string) => {
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[index] = {
            ...newFiles[index],
            metadata: {
              ...newFiles[index].metadata,
              [field]: value,
            },
          };
          return newFiles;
        });
      },
      []
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
          return;
        }

        const submitData: CreateUpdateRequest = {
          projectId: formData.projectId,
          updateType: getUpdateType(), // Automatically determined based on current time
          status: formData.status,
          updateDate: getTodayDate(), // Automatically set to today's date
          updateDescription: formData.updateDescription.trim() || undefined,
          documentMetadata: files.map((f) => f.metadata),
        };

        const fileArray = files.map((f) => f.file);
        const metadataArray = files.map((f) => f.metadata);

        await onSubmit(submitData, fileArray, metadataArray);
      },
      [formData, files, validateForm, onSubmit]
    );

    // Ensure video plays when stream is set
    useEffect(() => {
      const video = videoRef.current;
      const stream = streamRef.current;
      
      if (video && stream) {
        // Always ensure stream is attached
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }
        
        // Force play with retry logic
        const playVideo = async (retries = 3) => {
          try {
            if (video.paused || video.readyState < 2) {
              await video.play();
            }
          } catch (error) {
            console.error('Error playing video:', error);
            if (retries > 0) {
              setTimeout(() => playVideo(retries - 1), 200);
            }
          }
        };
        
        // Try to play immediately
        if (video.readyState >= 2) {
          playVideo();
        }
        
        // Listen for when video is ready
        const handleCanPlay = () => {
          playVideo();
        };
        
        const handleLoadedMetadata = () => {
          playVideo();
        };
        
        video.addEventListener('canplay', handleCanPlay, { once: true });
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        // video.addEventListener('playing', () => {
        //   console.log('Video is playing');
        // }, { once: true });
        
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
      }
    }, [isCameraActive, streamRef.current]);

    // Cleanup preview URLs and camera stream on unmount
    useEffect(() => {
      return () => {
        files.forEach((fileWithMeta) => {
          if (fileWithMeta.preview) {
            URL.revokeObjectURL(fileWithMeta.preview);
          }
        });
        stopCamera();
      };
    }, [files, stopCamera]);

    const projectOptions = [
      { value: '', label: 'Select a project' },
      ...availableProjects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];



    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          options={projectOptions}
          error={errors.projectId}
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Date & Time:</span> {new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Automatically recorded when you submit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-800">Update Type:</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  currentUpdateType === UpdateType.MORNING
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {currentUpdateType === UpdateType.MORNING ? 'Morning' : 'Evening'}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {currentUpdateType === UpdateType.MORNING
              ? 'Morning updates are for work done before 1:00 PM'
              : 'Evening updates are for work done after 1:00 PM'}
          </p>
        </div>

        <Input
          label="Status"
          name="status"
          type="text"
          value={formData.status}
          onChange={handleChange}
          placeholder="e.g., Work in progress, Completed tasks..."
          error={errors.status}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="updateDescription"
            value={formData.updateDescription}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the work done..."
            className="mt-1 block w-full rounded-md border border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] p-2"
          />
        </div>

        {/* Camera Capture Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos from Camera <span className="text-red-500">*</span>
          </label>

          {!isCameraActive && !streamRef.current ? (
            <button
              type="button"
              onClick={startCamera}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#2563EB] transition duration-300 text-gray-600 hover:text-[#2563EB]"
            >
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm font-medium">Start Camera</p>
                <p className="text-xs text-gray-500 mt-1">
                  Camera access required (Max 10 photos)
                </p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                {/* Video Preview Container */}
                <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px', width: '100%' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full"
                    style={{ 
                      width: '100%',
                      minHeight: '300px',
                      maxHeight: '500px',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      backgroundColor: '#000',
                      position: 'relative',
                      zIndex: 10
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Loading overlay - only show when loading */}
                  {isLoadingCamera && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-20" style={{ minHeight: '300px' }}>
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
                        <p>Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Camera Controls - Always visible when camera is active or stream exists */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={files.length >= 10 || isLoadingCamera || isGettingLocation}
                    className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Getting location...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Capture Photo
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    disabled={isLoadingCamera}
                    className="px-6 py-3 border-2 border-red-300 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition duration-300 whitespace-nowrap disabled:opacity-60"
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      />
                    </svg>
                    Stop Camera
                  </button>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{files.length}</span> photo{files.length !== 1 ? 's' : ''} captured
                      {files.length >= 10 && (
                        <span className="text-orange-600 ml-2">(Maximum reached)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{cameraError}</p>
            </div>
          )}

          {locationError && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{locationError}</p>
            </div>
          )}

          {errors.files && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.files}
            </p>
          )}
        </div>

        {/* File Preview and Metadata */}
        {files.length > 0 && (
          <div className="space-y-4">
            {files.map((fileWithMeta, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-x-hidden"
              >
                <div className="flex items-start gap-4">
                  {fileWithMeta.preview ? (
                    <img
                      src={fileWithMeta.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {fileWithMeta.file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Remove file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <Input
                      label="File Name (Optional)"
                      type="text"
                      value={fileWithMeta.metadata.fileName || ''}
                      onChange={(e) => updateFileMetadata(index, 'fileName', e.target.value)}
                      placeholder={fileWithMeta.file.name}
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={fileWithMeta.metadata.description || ''}
                        onChange={(e) =>
                          updateFileMetadata(index, 'description', e.target.value)
                        }
                        rows={2}
                        placeholder="Describe this document..."
                        className="w-full min-w-0 rounded-md border border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Work Log'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }
);

WorkLogForm.displayName = 'WorkLogForm';

export default WorkLogForm;

