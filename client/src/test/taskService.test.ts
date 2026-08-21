import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTasks, createTask } from '../services/taskService';
import { supabase } from '../integrations/supabase/client';

vi.mock('../integrations/supabase/client', () => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  
  mock.from.mockReturnValue(mock);
  mock.select.mockReturnValue(mock);
  mock.order.mockReturnValue(mock);
  mock.insert.mockReturnValue(mock);
  mock.update.mockReturnValue(mock);
  mock.delete.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.single.mockReturnValue(mock);

  return {
    supabase: mock,
  };
});

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchTasks should return mapped tasks', async () => {
    const mockData = [
      {
        id: '1',
        user_id: 'user1',
        title: 'Task 1',
        subject: 'Math',
        priority: 'high',
        estimated_minutes: 60,
        deadline: '2024-01-01',
        scheduled_date: '2024-01-01',
        scheduled_hour: 10,
        completed: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    (supabase.order as any)
      .mockReturnValueOnce(supabase)
      .mockReturnValue({ data: mockData, error: null });

    const tasks = await fetchTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 1');
  });

  it('createTask should insert and return new task', async () => {
    const newTask = {
      title: 'New Task',
      subject: 'Science',
      priority: 'medium' as const,
      estimatedMinutes: 30,
      deadline: '2024-01-02',
      scheduledDate: '2024-01-02',
      scheduledHour: 14,
      completed: false,
    };

    const mockResponse = {
      id: '2',
      user_id: 'user1',
      title: 'New Task',
      subject: 'Science',
      priority: 'medium',
      estimated_minutes: 30,
      deadline: '2024-01-02',
      scheduled_date: '2024-01-02',
      scheduled_hour: 14,
      completed: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (supabase.single as any).mockReturnValue({ data: mockResponse, error: null });

    const task = await createTask(newTask, 'user1');
    expect(task.title).toBe('New Task');
    expect(task.id).toBe('2');
  });
});
