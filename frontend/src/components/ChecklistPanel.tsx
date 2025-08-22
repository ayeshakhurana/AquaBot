import React, { useState } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

interface VoyageStage {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
}

const ChecklistPanel: React.FC = () => {
  const [stages] = useState<VoyageStage[]>([
    {
      id: 'pre_fixture',
      name: 'Pre-Fixture',
      description: 'Preparation before voyage begins',
      items: [
        { id: '1', text: 'Obtain charter party draft', completed: false, category: 'pre_fixture' },
        { id: '2', text: 'Review vessel certificates (class, P&I, statutory)', completed: false, category: 'pre_fixture' },
        { id: '3', text: 'Confirm cargo specs and load/discharge ports', completed: false, category: 'pre_fixture' },
        { id: '4', text: 'Nominate vessel and issue NOR requirements', completed: false, category: 'pre_fixture' }
      ]
    },
    {
      id: 'on_voyage',
      name: 'On-Voyage',
      description: 'During the voyage execution',
      items: [
        { id: '5', text: 'Issue NOR on arrival per CP terms', completed: false, category: 'on_voyage' },
        { id: '6', text: 'Record SOF events with timestamps', completed: false, category: 'on_voyage' },
        { id: '7', text: 'Monitor weather and routing', completed: false, category: 'on_voyage' },
        { id: '8', text: 'Exchange arrival/departure reports', completed: false, category: 'on_voyage' }
      ]
    },
    {
      id: 'post_voyage',
      name: 'Post-Voyage',
      description: 'After voyage completion',
      items: [
        { id: '9', text: 'Prepare laytime statement', completed: false, category: 'post_voyage' },
        { id: '10', text: 'Issue demurrage/despatch invoice', completed: false, category: 'post_voyage' },
        { id: '11', text: 'Archive CP, NOR, SOF, B/L copies', completed: false, category: 'post_voyage' },
        { id: '12', text: 'Submit performance and bunker reports', completed: false, category: 'post_voyage' }
      ]
    }
  ]);

  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getStageProgress = (stage: VoyageStage) => {
    const total = stage.items.length;
    const completed = stage.items.filter(item => completedItems.has(item.id)).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const getOverallProgress = () => {
    const total = stages.reduce((sum, stage) => sum + stage.items.length, 0);
    const completed = completedItems.size;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const overall = getOverallProgress();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        ✅ Voyage Checklist Manager
      </h2>

      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-800">Overall Progress</h3>
          <span className="text-sm text-blue-600">
            {overall.completed} of {overall.total} completed
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-blue-600">
          {overall.percentage.toFixed(1)}% Complete
        </div>
      </div>

      {/* Voyage Stages */}
      <div className="space-y-6">
        {stages.map(stage => {
          const progress = getStageProgress(stage);
          return (
            <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {progress.completed} of {progress.total}
                  </div>
                  <div className="text-xs text-gray-500">
                    {progress.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {stage.items.map(item => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={completedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span
                      className={`text-sm ${
                        completedItems.has(item.id)
                          ? 'text-gray-500 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setCompletedItems(new Set())}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={() => {
              const allIds = stages.flatMap(stage => stage.items.map(item => item.id));
              setCompletedItems(new Set(allIds));
            }}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Mark All Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPanel; 