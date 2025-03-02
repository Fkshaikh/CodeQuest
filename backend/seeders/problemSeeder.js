const Problem = require('../models/Problem'); // Assuming your Problem model is in '../models/Problem.js'
const { sequelize } = require('../shared/db'); // Assuming your sequelize instance is in '../shared/db.js'

const seedProblems = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established for seeding.');

    const problemsData = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```',
        difficulty: 'Easy',
        constraints: '2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109\nOnly one valid answer exists.',
        examples: '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]',
        testCases: JSON.stringify([
          { input: '[2, 7, 11, 15], 9', output: '[0, 1]' },
          { input: '[3, 2, 4], 6', output: '[1, 2]' },
          { input: '[3, 3], 6', output: '[0, 1]' },
        ]),
        solutionTemplate: 'function twoSum(nums, target) {\n  // Your code here\n}',
      },
      {
        title: 'Reverse Linked List',
        description: 'Given the `head` of a singly linked list, reverse the list, and return _the reversed list_.\n\n**Example 1:**\n\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```',
        difficulty: 'Easy',
        constraints: 'The number of nodes in the list is in the range `[0, 5000]`.\n`-5000 <= Node.val <= 5000`',
        examples: '[{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}]',
        testCases: JSON.stringify([
          { input: '[1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
          { input: '[1, 2]', output: '[2, 1]' },
          { input: '[]', output: '[]' },
        ]),
        solutionTemplate: 'function reverseList(head) {\n  // Your code here\n}',
      },
      // Add more problems here as needed
    ];

    await Problem.bulkCreate(problemsData);
    console.log('Problems seeded successfully!');
  } catch (error) {
    console.error('Failed to seed problems:', error);
  } finally {
    await sequelize.close();
  }
};

seedProblems(); 