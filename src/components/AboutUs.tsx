'use client';

import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Innovation',
    description: 'We constantly push the boundaries of what\'s possible in messaging technology.',
    icon: LightBulbIcon,
  },
  {
    name: 'Security',
    description: 'Your privacy and security are our top priorities. All messages are end-to-end encrypted.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Communication',
    description: 'We believe in making communication simple, fast, and reliable for everyone.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Community',
    description: 'Building a global community of users who value privacy and meaningful connections.',
    icon: UserGroupIcon,
  },
  {
    name: 'Global Reach',
    description: 'Connecting people across borders with our secure messaging platform.',
    icon: GlobeAltIcon,
  },
  {
    name: 'User-Centric',
    description: 'Every feature is designed with our users\' needs and feedback in mind.',
    icon: HeartIcon,
  },
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'David Kim',
    role: 'Security Lead',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export default function AboutUs() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              About Catch My Message
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              We're on a mission to revolutionize the way people communicate, making it more secure, private, and meaningful.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Story
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            Founded in 2023, Catch My Message was born out of a simple idea: to create a messaging platform that puts privacy and user experience first. 
            We believe that communication should be secure, simple, and accessible to everyone.
          </p>
        </motion.div>
      </div>

      {/* Features */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-1 text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Team
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            Meet the passionate individuals behind Catch My Message who are dedicated to making your messaging experience better.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {team.map((person) => (
            <div key={person.name} className="text-center">
              <img
                className="mx-auto h-32 w-32 rounded-full"
                src={person.image}
                alt={person.name}
              />
              <h3 className="mt-6 text-lg font-medium text-gray-900">{person.name}</h3>
              <p className="mt-1 text-gray-500">{person.role}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to join us?
            </h2>
            <p className="mt-3 text-lg text-blue-100">
              Start using Catch My Message today and experience the difference.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-8 flex lg:mt-0 lg:flex-shrink-0 justify-center"
          >
            <div className="inline-flex rounded-md shadow">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 