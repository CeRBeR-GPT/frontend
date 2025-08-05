import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from './MessageInput';
import { useChats, useMessageOptions } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { useChangeProvider } from '@/features/change-provider/hooks';

// Мокаем все зависимости
jest.mock('../hooks', () => ({
  useChangeProvider: jest.fn(),
  useChats: jest.fn(),
  useMessageOptions: jest.fn(),
}));

jest.mock('@/shared/components/ui/button', () => ({
  Button: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Мокаем иконки
jest.mock('lucide-react', () => ({
  ArrowUp: () => <span>ArrowUpIcon</span>,
}));

jest.mock('@/shared/components/document-icon', () => () => <span>DocumentIcon</span>);

jest.mock('@/shared/components/ui/speech-icon', () => () => <span>SpeechIcon</span>);

describe('MessageInput Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn((e) => e.preventDefault());
  const mockHandleProviderChange = jest.fn();
  const mockHandleFileUpload = jest.fn();
  const mockHandleFileChange = jest.fn();
  const mockAdjustTextareaHeight = jest.fn();
  const mockStartRecording = jest.fn();
  const mockStopRecording = jest.fn();

  beforeEach(() => {
    (useChangeProvider as jest.Mock).mockReturnValue({
      selectedProvider: 'provider1',
      availableProviders: ['provider1', 'provider2'],
      handleProviderChange: mockHandleProviderChange,
    });

    (useChats as jest.Mock).mockReturnValue({
      isLoading: false,
    });

    (useMessageOptions as jest.Mock).mockReturnValue({
      handleFileUpload: mockHandleFileUpload,
      handleFileChange: mockHandleFileChange,
      adjustTextareaHeight: mockAdjustTextareaHeight,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      isRecording: false,
      recordingStatus: 'idle',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('Напишите ваш запрос...')).toBeInTheDocument();
    expect(screen.getByText('DocumentIcon')).toBeInTheDocument();
    expect(screen.getByText('SpeechIcon')).toBeInTheDocument();
    expect(screen.getByText('ArrowUpIcon')).toBeInTheDocument();
    expect(
      screen.getByText('AI может допускать ошибки. Проверяйте важную информацию.')
    ).toBeInTheDocument();
  });

  it('handles text input and submission', async () => {
    render(<MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Напишите ваш запрос...');
    await userEvent.type(textarea, 'test message');

    expect(mockOnChange).toHaveBeenCalledTimes(11); // 11 символов в "test message"

    const submitButton = screen.getByText('ArrowUpIcon').closest('button');
    fireEvent.click(submitButton!);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('disables submit button when input is empty or loading', () => {
    const { rerender } = render(
      <MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('ArrowUpIcon').closest('button')).toBeDisabled();

    rerender(<MessageInput value="test" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('ArrowUpIcon').closest('button')).not.toBeDisabled();

    (useChats as jest.Mock).mockReturnValueOnce({ isLoading: true });
    rerender(<MessageInput value="test" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('ArrowUpIcon').closest('button')).toBeDisabled();
  });

  it('handles file upload click', async () => {
    render(<MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    const fileButton = screen.getByText('DocumentIcon').closest('button');
    fireEvent.click(fileButton!);

    expect(mockHandleFileUpload).toHaveBeenCalled();
  });

  it('handles voice recording', async () => {
    const { rerender } = render(
      <MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    const voiceButton = screen.getByText('SpeechIcon').closest('button');
    fireEvent.click(voiceButton!);

    expect(mockStartRecording).toHaveBeenCalled();

    // Тестируем состояние записи
    (useMessageOptions as jest.Mock).mockReturnValueOnce({
      ...useMessageOptions.mock.results[0].value,
      isRecording: true,
      recordingStatus: 'recording',
    });

    rerender(<MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();

    fireEvent.click(voiceButton!);
    expect(mockStopRecording).toHaveBeenCalled();
  });

  it('submits on Enter key press', async () => {
    render(<MessageInput value="test" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Напишите ваш запрос...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('does not submit on Shift+Enter', async () => {
    render(<MessageInput value="test" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Напишите ваш запрос...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('adjusts textarea height when value changes', () => {
    const { rerender } = render(
      <MessageInput value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    expect(mockAdjustTextareaHeight).toHaveBeenCalled();

    rerender(<MessageInput value="new value" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    expect(mockAdjustTextareaHeight).toHaveBeenCalledTimes(2);
  });
});
