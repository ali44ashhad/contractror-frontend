import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { getAllProjects } from '../../services/projectService';
import { getProjectReport } from '../../services/reportService';
import { Project, ProjectStatus } from '../../types/project.types';
import { ProjectReport, MemberUpdate, GetProjectReportResponse } from '../../types/report.types';
import { Update, UserReference } from '../../types/update.types';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';

type ReportType = 'daily' | 'weekly';

/**
 * ReportsPage component
 * Displays project-specific daily and weekly reports with team members and updates
 */
const ReportsPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    // Default end date to 6 days after start date (7 days total)
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 6);
    const year = end.getUTCFullYear();
    const month = String(end.getUTCMonth() + 1).padStart(2, '0');
    const day = String(end.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects on mount (excluding planning status)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        // Filter out projects with planning status
        const filteredProjects = (response.data || []).filter(
          (project) => project.status !== ProjectStatus.PLANNING
        );
        setProjects(filteredProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Auto-adjust end date when switching to weekly report type
  useEffect(() => {
    if (reportType === 'weekly' && startDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6); // 7 days total
      const year = end.getUTCFullYear();
      const month = String(end.getUTCMonth() + 1).padStart(2, '0');
      const day = String(end.getUTCDate()).padStart(2, '0');
      const calculatedEndDate = `${year}-${month}-${day}`;
      if (endDate !== calculatedEndDate) {
        setEndDate(calculatedEndDate);
      }
    }
  }, [reportType, startDate]); // Only run when reportType or startDate changes

  // Auto-adjust end date when switching to weekly report type
  useEffect(() => {
    if (reportType === 'weekly' && startDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6); // 7 days total
      const year = end.getUTCFullYear();
      const month = String(end.getUTCMonth() + 1).padStart(2, '0');
      const day = String(end.getUTCDate()).padStart(2, '0');
      const calculatedEndDate = `${year}-${month}-${day}`;
      if (endDate !== calculatedEndDate) {
        setEndDate(calculatedEndDate);
      }
    }
  }, [reportType, startDate]); // Only run when reportType or startDate changes

  // Handle start date change for weekly reports (auto-adjust end date to 7 days)
  const handleStartDateChange = useCallback((newStartDate: string) => {
    setStartDate(newStartDate);
    if (reportType === 'weekly') {
      const start = new Date(newStartDate + 'T00:00:00.000Z');
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6); // 7 days total (start + 6 more days)
      const year = end.getUTCFullYear();
      const month = String(end.getUTCMonth() + 1).padStart(2, '0');
      const day = String(end.getUTCDate()).padStart(2, '0');
      setEndDate(`${year}-${month}-${day}`);
    }
  }, [reportType]);

  // Handle end date change for weekly reports (validate 7-day window)
  const handleEndDateChange = useCallback((newEndDate: string) => {
    if (reportType === 'weekly') {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(newEndDate + 'T00:00:00.000Z');
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If more than 7 days, adjust to exactly 7 days from start
      if (diffDays > 6) {
        const adjustedEnd = new Date(start);
        adjustedEnd.setUTCDate(adjustedEnd.getUTCDate() + 6);
        const year = adjustedEnd.getUTCFullYear();
        const month = String(adjustedEnd.getUTCMonth() + 1).padStart(2, '0');
        const day = String(adjustedEnd.getUTCDate()).padStart(2, '0');
        setEndDate(`${year}-${month}-${day}`);
      } else {
        setEndDate(newEndDate);
      }
    } else {
      setEndDate(newEndDate);
    }
  }, [reportType, startDate]);

  // Calculate date range based on report type
  const dateRange = useMemo(() => {
    if (reportType === 'daily') {
      return {
        startDate: selectedDate,
        endDate: selectedDate,
      };
    } else {
      return {
        startDate,
        endDate,
      };
    }
  }, [reportType, selectedDate, startDate, endDate]);

  // Validate date range for weekly (must be exactly 7 days)
  const isWeeklyRangeValid = useMemo(() => {
    if (reportType !== 'weekly') return true;
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T00:00:00.000Z');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 6; // 7 days total (0 to 6 inclusive)
  }, [reportType, startDate, endDate]);

  // Fetch report function
  const fetchReportFn = useCallback(async (): Promise<GetProjectReportResponse> => {
    if (!selectedProjectId || !dateRange.startDate || !dateRange.endDate) {
      // Return a valid response structure even when missing params
      // This should not happen in practice as button is disabled
      throw new Error('Project ID and date range are required');
    }
    return getProjectReport(selectedProjectId, dateRange.startDate, dateRange.endDate);
  }, [selectedProjectId, dateRange]);

  const {
    data: reportResponse,
    isLoading: isLoadingReport,
    error: reportError,
    execute: fetchReport,
  } = useApi(fetchReportFn);

  // Handle generate report button click
  const handleGenerateReport = useCallback(() => {
    if (!selectedProjectId) {
      return;
    }
    if (!dateRange.startDate || !dateRange.endDate) {
      return;
    }
    fetchReport();
  }, [selectedProjectId, dateRange, fetchReport]);

  const report: ProjectReport | null = reportResponse?.success ? reportResponse.data : null;

  // Get member name helper
  const getMemberName = (member: string | UserReference): string => {
    if (typeof member === 'string') return 'Unknown';
    return member.name || member.email || 'Unknown';
  };

  // Get member ID helper
  const getMemberId = (member: string | UserReference): string => {
    if (typeof member === 'string') return member;
    return member._id;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get sorted dates from date range (ensures all dates are shown even if no updates)
  const sortedDates = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return [];
    
    const dates: string[] = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort newest first
    return dates.sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [dateRange]);

  // Get selected project
  const selectedProject = useMemo(() => {
    return projects.find((p) => p._id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Validate dates against project dates
  const dateValidationErrors = useMemo(() => {
    const errors: {
      selectedDate?: string;
      startDate?: string;
      endDate?: string;
    } = {};

    if (!selectedProject) return errors;

    const projectStartDate = selectedProject.startDate
      ? new Date(selectedProject.startDate + 'T00:00:00.000Z')
      : null;
    const projectEndDate = selectedProject.endDate
      ? new Date(selectedProject.endDate + 'T23:59:59.999Z')
      : null;

    if (reportType === 'daily') {
      if (selectedDate && projectStartDate) {
        const selected = new Date(selectedDate + 'T00:00:00.000Z');
        if (selected < projectStartDate) {
          errors.selectedDate = `Date cannot be before project start date (${new Date(projectStartDate).toLocaleDateString()})`;
        }
      }
      if (selectedDate && projectEndDate) {
        const selected = new Date(selectedDate + 'T23:59:59.999Z');
        if (selected > projectEndDate) {
          errors.selectedDate = `Date cannot be after project deadline (${new Date(projectEndDate).toLocaleDateString()})`;
        }
      }
    } else {
      // Weekly reports
      if (startDate && projectStartDate) {
        const start = new Date(startDate + 'T00:00:00.000Z');
        if (start < projectStartDate) {
          errors.startDate = `Start date cannot be before project start date (${new Date(projectStartDate).toLocaleDateString()})`;
        }
      }
      if (endDate && projectEndDate) {
        const end = new Date(endDate + 'T23:59:59.999Z');
        if (end > projectEndDate) {
          errors.endDate = `End date cannot be after project deadline (${new Date(projectEndDate).toLocaleDateString()})`;
        }
      }
    }

    return errors;
  }, [selectedProject, reportType, selectedDate, startDate, endDate]);

  const isDateRangeValid = useMemo(() => {
    return Object.keys(dateValidationErrors).length === 0;
  }, [dateValidationErrors]);

  // Project options for dropdown
  const projectOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a project' },
      ...projects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Select
              label="Project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={projectOptions}
            />
          </div>
          <div>
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
          </div>
          {reportType === 'daily' ? (
            <div>
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={selectedProject?.startDate ? selectedProject.startDate.split('T')[0] : undefined}
                max={selectedProject?.endDate ? selectedProject.endDate.split('T')[0] : undefined}
                error={dateValidationErrors.selectedDate}
              />
            </div>
          ) : (
            <>
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={selectedProject?.startDate ? selectedProject.startDate.split('T')[0] : undefined}
                  max={(() => {
                    // Max start date is either project end date or 6 days before endDate
                    if (selectedProject?.endDate) {
                      const projectEnd = new Date(selectedProject.endDate + 'T00:00:00.000Z');
                      const maxStart = new Date(projectEnd);
                      maxStart.setUTCDate(maxStart.getUTCDate() - 6);
                      const year = maxStart.getUTCFullYear();
                      const month = String(maxStart.getUTCMonth() + 1).padStart(2, '0');
                      const day = String(maxStart.getUTCDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    }
                    return undefined;
                  })()}
                  error={dateValidationErrors.startDate}
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={(() => {
                    if (reportType === 'weekly' && startDate) {
                      const start = new Date(startDate + 'T00:00:00.000Z');
                      const minEnd = new Date(start);
                      const year = minEnd.getUTCFullYear();
                      const month = String(minEnd.getUTCMonth() + 1).padStart(2, '0');
                      const day = String(minEnd.getUTCDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    }
                    return undefined;
                  })()}
                  max={(() => {
                    const maxValues: string[] = [];
                    if (reportType === 'weekly' && startDate) {
                      const start = new Date(startDate + 'T00:00:00.000Z');
                      const maxEnd = new Date(start);
                      maxEnd.setUTCDate(maxEnd.getUTCDate() + 6);
                      const year = maxEnd.getUTCFullYear();
                      const month = String(maxEnd.getUTCMonth() + 1).padStart(2, '0');
                      const day = String(maxEnd.getUTCDate()).padStart(2, '0');
                      maxValues.push(`${year}-${month}-${day}`);
                    }
                    if (selectedProject?.endDate) {
                      maxValues.push(selectedProject.endDate.split('T')[0]);
                    }
                    // Return the earliest (most restrictive) date
                    return maxValues.length > 0 ? maxValues.sort()[0] : undefined;
                  })()}
                  error={dateValidationErrors.endDate}
                />
                {reportType === 'weekly' && !isWeeklyRangeValid && (
                  <p className="mt-1 text-xs text-orange-600">
                    Weekly reports must cover exactly 7 days
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerateReport}
            isLoading={isLoadingReport}
            disabled={
              !selectedProjectId ||
              !dateRange.startDate ||
              !dateRange.endDate ||
              (reportType === 'weekly' && !isWeeklyRangeValid) ||
              !isDateRangeValid
            }
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Content - Only show if report has been generated */}
      {!reportResponse ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">Click "Generate Report" to view the report</p>
        </div>
      ) : !selectedProjectId ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">Please select a project to view reports</p>
        </div>
      ) : isLoadingReport ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">Loading report...</p>
        </div>
      ) : reportError ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-red-500">
            {reportError || 'Failed to load report'}
          </p>
        </div>
      ) : !report ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">No project data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{report.project.name}</h3>
            <p className="text-gray-600 text-sm">{report.project.description}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-gray-500">
                Teams: <span className="font-semibold text-gray-800">{report.teams.length}</span>
              </span>
              <span className="text-gray-500">
                Members:{' '}
                <span className="font-semibold text-gray-800">{report.members.length}                </span>
              </span>
            </div>
          </div>

          {/* Timeline */}
          {sortedDates.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
              <p className="text-gray-500">Please select a valid date range</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => {
              const dateUpdates = report.updatesByDate[dateKey] || {};

              return (
                <div
                  key={dateKey}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    {formatDate(dateKey)}
                  </h4>

                  <div className="space-y-6">
                    {report.members.length === 0 ? (
                      <p className="text-gray-400 italic text-sm text-center py-4">
                        No team members assigned to this project
                      </p>
                    ) : (
                      report.members.map((member) => {
                        const memberId = getMemberId(member);
                        const memberUpdate: MemberUpdate | undefined = dateUpdates[memberId] || {
                          morning: null,
                          evening: null,
                        };

                        return (
                          <div
                            key={memberId}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <h5 className="font-semibold text-gray-800 mb-3">
                              {getMemberName(member)}
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Morning Update */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Morning
                                  </span>
                                </div>
                                {memberUpdate.morning ? (
                                  <UpdateDisplay update={memberUpdate.morning} />
                                ) : (
                                  <p className="text-gray-400 italic text-sm">
                                    No morning update recorded
                                  </p>
                                )}
                              </div>

                              {/* Evening Update */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                    Evening
                                  </span>
                                </div>
                                {memberUpdate.evening ? (
                                  <UpdateDisplay update={memberUpdate.evening} />
                                ) : (
                                  <p className="text-gray-400 italic text-sm">
                                    No evening update recorded
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/**
 * UpdateDisplay component to show update details
 */
const UpdateDisplay: React.FC<{ update: Update }> = ({ update }) => {
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
        <p className="text-sm font-medium text-gray-800 mt-1">{update.status}</p>
      </div>

      {update.updateDescription && (
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Description
          </span>
          <p className="text-sm text-gray-700 mt-1">{update.updateDescription}</p>
        </div>
      )}

      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Timestamp
        </span>
        <p className="text-sm text-gray-600 mt-1">{formatTimestamp(update.timestamp)}</p>
      </div>

      {update.documents && update.documents.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Documents ({update.documents.length})
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {update.documents.slice(0, 4).map((doc, index) => (
              <div key={index} className="relative">
                <img
                  src={doc.filePath}
                  alt={doc.fileName || `Document ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      'https://placehold.co/200x150/cccccc/000000?text=Image';
                  }}
                />
                {doc.latitude !== undefined && doc.longitude !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b">
                    <div className="truncate">
                      📍{' '}
                      <a
                        href={`https://www.google.com/maps?q=${doc.latitude},${doc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lat: {doc.latitude.toFixed(6)}, Lng: {doc.longitude.toFixed(6)}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {update.documents.length > 4 && (
            <p className="text-xs text-gray-500 mt-2">
              +{update.documents.length - 4} more document(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

