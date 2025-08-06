import { describe, it, expect } from 'vitest';
import { useReviewStore } from './store'; // Adjust the import path as needed

describe('Spaced Repetition Algorithm', () => {
  it('should correctly demote a card when answered "Again"', () => {
    // Create a mock card
    const mockCard = {
      id: '1',
      artworkUrl: 'test-url',
      durationMs: 200000,
      deck: 'NEW' as const,
      easiness: 2.5,
      interval: 5,
      reps: 1,
      nextDue: Date.now() + 5 * 86400000,
      playbackStartPosition: 0,
    };

    // Load the card into the store
    useReviewStore.setState({
      cards: { '1': mockCard },
      queue: ['1'],
      currentId: '1',
    });
    
    // Answer the card as "Again" (isGood = false)
    useReviewStore.getState().answer(false);
    
    const updatedCard = useReviewStore.getState().cards['1'];
    
    // Assertions
    expect(updatedCard.deck).toBe('AGAIN');
    expect(updatedCard.interval).toBe(1);
    expect(updatedCard.easiness).toBe(2.3); // 2.5 - 0.2
    expect(updatedCard.reps).toBe(2);
    expect(updatedCard.nextDue).toBeCloseTo(Date.now(), -2); // Check if it's due now
  });

  it('should correctly promote a card when answered "Good"', () => {
    const mockCard = {
      id: '2',
      artworkUrl: 'test-url',
      durationMs: 200000,
      deck: 'AGAIN' as const,
      easiness: 2.5,
      interval: 1,
      reps: 1,
      nextDue: Date.now(),
      playbackStartPosition: 0,
    };

    useReviewStore.setState({
      cards: { '2': mockCard },
      queue: ['2'],
      currentId: '2',
    });

    useReviewStore.getState().answer(true);

    const updatedCard = useReviewStore.getState().cards['2'];

    expect(updatedCard.deck).toBe('AGAIN'); // Should still be in AGAIN for a short interval
    expect(updatedCard.interval).toBe(3); // ceil(1 * (2.5 + 0.1))
    expect(updatedCard.easiness).toBe(2.6); // 2.5 + 0.1
    expect(updatedCard.reps).toBe(2);
  });
}); 