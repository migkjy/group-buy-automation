import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCards from '@/components/admin/dashboard/summary-cards';

describe('SummaryCards', () => {
  it('renders loading skeletons when data is null', () => {
    const { container } = render(<SummaryCards data={null} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('renders summary data correctly', () => {
    render(
      <SummaryCards
        data={{
          totalRevenue: 1500000,
          totalOrders: 42,
          activeDeals: 3,
          avgOrderValue: 35714,
        }}
      />
    );

    expect(screen.getByText('1,500,000원')).toBeInTheDocument();
    expect(screen.getByText('42건')).toBeInTheDocument();
    expect(screen.getByText('3개')).toBeInTheDocument();
    expect(screen.getByText('35,714원')).toBeInTheDocument();
  });
});
