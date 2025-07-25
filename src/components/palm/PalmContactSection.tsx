'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  Globe,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PalmContactSection() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help within 24 hours',
      contact: 'support@palmai.com',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant support during business hours',
      contact: 'Available 9 AM - 6 PM PST',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Premium users only',
      contact: '+1 (555) 123-PALM',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const officeInfo = [
    {
      icon: MapPin,
      label: 'Address',
      value: 'San Francisco, CA',
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Mon-Fri 9 AM - 6 PM PST',
    },
    {
      icon: Globe,
      label: 'Languages',
      value: 'English, Spanish, Chinese',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <Heart className="w-3 h-3 mr-1" />
            We're Here to Help
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about your palm reading or need technical support? 
            Our friendly team is here to help you every step of the way.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Send us a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <Input 
                      placeholder="John"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <Input 
                      placeholder="Doe"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input 
                    type="email"
                    placeholder="john@example.com"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input 
                    placeholder="How can we help you?"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us more about your question or issue..."
                    rows={5}
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Send Message
                  <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Contact Methods */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Contact Methods
              </h3>
              
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center shadow-lg`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          {method.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {method.description}
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {method.contact}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Office Information */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Office Information
              </h3>
              
              <Card className="p-6">
                <div className="space-y-4">
                  {officeInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <info.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {info.label}:
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {info.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Response Time */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  Quick Response Guarantee
                </h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                We typically respond to all inquiries within 24 hours. 
                Premium users get priority support with responses within 4 hours.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}