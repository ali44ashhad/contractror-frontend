import {
  Clock,
  BarChart2,
  Key,
  MessageSquare,
  FileText,
  Umbrella,
} from 'lucide-react';
import { FiTool } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';
import images from './images';

export interface Service {
  title: string;
  description: string;
  imageUrl: string;
}

export interface ServiceIcon {
  title: string;
  Icon: React.ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
}

export interface WorkflowStep {
  step: number;
  title: string;
}

export interface FeatureItem {
  type: 'card' | 'image';
  title: string;
  description?: string;
  metric?: string;
  metricLabel?: string;
  icon?: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  image?: string;
  className: string;
}

export const serviceData: Service[] = [
  {
    title: 'Residential Construction',
    description:
      'From modern homes to luxury villas, we deliver top-quality residential projects with a focus on durability and design excellence.',
    imageUrl: images.homeCard,
  },
  {
    title: 'Commercial Projects',
    description:
      'We specialize in constructing offices, showrooms, and industrial buildings that combine functionality with aesthetic appeal.',
    imageUrl: images.homeCard2,
  },
  {
    title: 'Renovation & Remodeling',
    description:
      'Transform your existing spaces with our expert renovation services, ensuring modern style, safety, and enhanced functionality.',
    imageUrl: images.homeCard3,
  },
];

export const services: ServiceIcon[] = [
  { title: 'Consultation per Hour', Icon: Clock },
  { title: 'Consultation per Question', Icon: BarChart2 },
  { title: 'Full Package Service', Icon: Key },
  { title: 'Application Review', Icon: MessageSquare },
  { title: 'Immigration Plan', Icon: FileText },
  { title: 'Settlement Advising', Icon: Umbrella },
];

export const workflowSteps: WorkflowStep[] = [
  { step: 1, title: 'Choose Construction Project' },
  { step: 2, title: 'Planning & Design' },
  { step: 3, title: 'Construction Phase' },
  { step: 4, title: 'Quality Inspection & Handover' },
];

export const featuresData: FeatureItem[] = [
  {
    type: 'card',
    title: 'Innovation Solutions',
    description:
      'Simple actions make a difference. It starts and ends with each employee striving to work safer every single day so they can return.',
    metric: '800+',
    metricLabel: 'Projects Completed',
    icon: FaLightbulb,
    className: 'order-1 lg:order-1',
  },
  {
    type: 'image',
    title: 'Construction Image',
    image: images.homeFeature1,
    className: 'order-3 lg:order-2',
  },
  {
    type: 'card',
    title: 'Quality Craftsmanship',
    description:
      'Simple actions make a difference. It starts and ends with each employee striving to work safer every single day so they can return.',
    metric: '800+',
    metricLabel: 'Projects Completed',
    icon: FiTool,
    className: 'order-2 lg:order-3',
  },
];

