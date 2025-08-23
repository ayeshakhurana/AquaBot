import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Square, BarChart3, Clock, FileText, Wrench, Package, Settings } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'Legal' | 'Technical' | 'Cargo' | 'Operations';
  completed: boolean;
  required: boolean;
}

interface VoyageStage {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
}

const Checklist: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState('pre-fixture');
  
  const [voyageStages, setVoyageStages] = useState<VoyageStage[]>([
    {
      id: 'pre-fixture',
      name: 'Pre-Fixture',
      description: 'Essential preparations before charter agreement',
      items: [
        {
          id: 'pf1',
          title: 'Charter Party Review',
          description: 'Review and validate all charter party terms and conditions',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'pf2',
          title: 'Vessel Inspection Certificate',
          description: 'Ensure valid inspection certificates are available',
          category: 'Technical',
          completed: false,
          required: true
        },
        {
          id: 'pf3',
          title: 'Cargo Handling Equipment Check',
          description: 'Verify all cargo handling equipment is operational',
          category: 'Technical',
          completed: false,
          required: true
        },
        {
          id: 'pf4',
          title: 'Port Clearance Documentation',
          description: 'Prepare all required port clearance documents',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'pf5',
          title: 'Insurance Coverage Verification',
          description: 'Confirm adequate insurance coverage for voyage',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'pf6',
          title: 'Fuel Calculation and Planning',
          description: 'Calculate fuel requirements and plan bunkering',
          category: 'Operations',
          completed: false,
          required: false
        }
      ]
    },
    {
      id: 'on-voyage',
      name: 'On-Voyage',
      description: 'Critical tasks during voyage execution',
      items: [
        {
          id: 'ov1',
          title: 'Statement of Facts (SOF) Preparation',
          description: 'Maintain accurate records of all voyage events',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'ov2',
          title: 'Cargo Loading/Discharge Monitoring',
          description: 'Monitor cargo operations and document any issues',
          category: 'Cargo',
          completed: false,
          required: true
        },
        {
          id: 'ov3',
          title: 'Weather Routing Updates',
          description: 'Monitor weather conditions and optimize route',
          category: 'Operations',
          completed: false,
          required: false
        },
        {
          id: 'ov4',
          title: 'Port Agent Coordination',
          description: 'Maintain communication with port agents at all stops',
          category: 'Operations',
          completed: false,
          required: true
        },
        {
          id: 'ov5',
          title: 'Bunker Delivery Notes (BDN)',
          description: 'Collect and verify all bunker delivery documentation',
          category: 'Technical',
          completed: false,
          required: true
        },
        {
          id: 'ov6',
          title: 'Cargo Temperature Monitoring',
          description: 'Monitor and log cargo temperature (if applicable)',
          category: 'Cargo',
          completed: false,
          required: false
        }
      ]
    },
    {
      id: 'post-voyage',
      name: 'Post-Voyage',
      description: 'Completion and documentation tasks',
      items: [
        {
          id: 'pv1',
          title: 'Final SOF Compilation',
          description: 'Compile and submit final Statement of Facts',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'pv2',
          title: 'Demurrage/Despatch Calculation',
          description: 'Calculate and document demurrage or despatch claims',
          category: 'Legal',
          completed: false,
          required: true
        },
        {
          id: 'pv3',
          title: 'Cargo Delivery Confirmation',
          description: 'Obtain signed delivery receipts and cargo certificates',
          category: 'Cargo',
          completed: false,
          required: true
        },
        {
          id: 'pv4',
          title: 'Port Dues and Charges Settlement',
          description: 'Settle all outstanding port charges and fees',
          category: 'Operations',
          completed: false,
          required: true
        },
        {
          id: 'pv5',
          title: 'Vessel Performance Report',
          description: 'Compile vessel performance data and fuel consumption',
          category: 'Technical',
          completed: false,
          required: false
        },
        {
          id: 'pv6',
          title: 'Final Voyage Report',
          description: 'Submit comprehensive voyage completion report',
          category: 'Operations',
          completed: false,
          required: true
        }
      ]
    }
  ]);

  const toggleItem = (stageId: string, itemId: string) => {
    setVoyageStages(prevStages =>
      prevStages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,
              items: stage.items.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            }
          : stage
      )
    );
  };

  const getStageProgress = (stage: VoyageStage) => {
    const totalItems = stage.items.length;
    const completedItems = stage.items.filter(item => item.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Legal': return FileText;
      case 'Technical': return Wrench;
      case 'Cargo': return Package;
      case 'Operations': return Settings;
      default: return CheckSquare;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Legal': return 'bg-blue-100 text-blue-800';
      case 'Technical': return 'bg-green-100 text-green-800';
      case 'Cargo': return 'bg-purple-100 text-purple-800';
      case 'Operations': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentStage = voyageStages.find(stage => stage.id === selectedStage)!;
  const progress = getStageProgress(currentStage);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-200/50">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Voyage Checklists</h1>
                <p className="text-gray-600">Stage-based management with progress tracking</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stage Selection */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Voyage Stages</h2>
              
              <div className="space-y-3">
                {voyageStages.map((stage) => {
                  const stageProgress = getStageProgress(stage);
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                        selectedStage === stage.id
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white/60 border border-gray-200 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{stage.name}</h3>
                        <span className="text-sm">{stageProgress}%</span>
                      </div>
                      <p className={`text-sm ${
                        selectedStage === stage.id ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {stage.description}
                      </p>
                      <div className="mt-3">
                        <div className={`w-full h-2 rounded-full ${
                          selectedStage === stage.id ? 'bg-blue-400' : 'bg-gray-200'
                        }`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              selectedStage === stage.id ? 'bg-white' : 'bg-blue-500'
                            }`}
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Checklist Items */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{currentStage.name}</h2>
                  <p className="text-gray-600">{currentStage.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{progress}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>

              <div className="space-y-4">
                {currentStage.items.map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleItem(currentStage.id, item.id)}
                          className={`mt-1 p-1 rounded transition-colors ${
                            item.completed
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {item.completed ? (
                            <CheckSquare className="w-6 h-6" />
                          ) : (
                            <Square className="w-6 h-6" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${
                              item.completed ? 'text-green-800 line-through' : 'text-gray-900'
                            }`}>
                              {item.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            {item.required && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            item.completed ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        </div>

                        <Icon className={`w-5 h-5 ${
                          item.completed ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Info */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Checklist Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 rounded-full bg-blue-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stage-Based Management</h3>
                <p className="text-gray-600">Organized checklists for pre-fixture, on-voyage, and post-voyage stages with progress tracking</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-green-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Categorization</h3>
                <p className="text-gray-600">Tasks organized by category (Legal, Technical, Cargo, Operations) for better workflow management</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-purple-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-gray-600">Real-time progress visualization and completion status for each voyage stage</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Checklist; 