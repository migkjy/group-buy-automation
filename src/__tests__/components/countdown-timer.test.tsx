import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountdownTimer from '@/components/ui/countdown-timer';

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows countdown for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T00:00:00Z'));

    render(<CountdownTimer endDate="2026-03-10T12:00:00Z" />);

    expect(screen.getByText('D-2')).toBeInTheDocument();
  });

  it('shows expired for past date', () => {
    render(
      <CountdownTimer endDate={new Date(Date.now() - 100000).toISOString()} />
    );

    expect(screen.getByText('마감됨')).toBeInTheDocument();
  });
});
