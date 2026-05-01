import { renderWithProviders } from '../utils/testWrapper';
import { screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../app/(main)/(tabs)/index';

describe('HomeScreen', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.getByTestId('search-input')).toBeTruthy();
  });

  it('renders home data after loading', async () => {
    renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeTruthy();
    });

    expect(screen.getByText('home.new_arrivals')).toBeTruthy();
    expect(screen.getByText('home.popular')).toBeTruthy();
    expect(screen.getByText('Test Product')).toBeTruthy();
  });
});
