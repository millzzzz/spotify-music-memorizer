import { Button } from "@/components/ui/button"
import { useReviewStore } from "@/lib/store"
import { useEffect, useState } from "react";

type Deck = 'NEW' | 'AGAIN' | 'GOOD';

interface DeckOverviewProps {
  onDeckSelect: (deck: Deck) => void;
}

export function DeckOverview({ onDeckSelect }: DeckOverviewProps) {
  const { cards, activeDeck, _hasHydrated } = useReviewStore();
  const [newCount, setNewCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);

  useEffect(() => {
    if (_hasHydrated) {
      setNewCount(Object.values(cards).filter(c => c.deck === 'NEW').length);
      setAgainCount(Object.values(cards).filter(c => c.deck === 'AGAIN' && c.nextDue <= Date.now()).length);
      setGoodCount(Object.values(cards).filter(c => c.deck === 'GOOD').length);
    }
  }, [_hasHydrated, cards]);

  if (!_hasHydrated) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Deck Overview</h1>
        <div className="space-y-2 mt-4">
          <Button className="w-full justify-between" variant="outline" disabled>Loading...</Button>
          <Button className="w-full justify-between" variant="outline" disabled>Loading...</Button>
          <Button className="w-full justify-between" variant="outline" disabled>Loading...</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center">Deck Overview</h1>
      <div className="space-y-2 mt-4">
        <Button onClick={() => onDeckSelect('NEW')} className="w-full justify-between" variant={activeDeck === 'NEW' ? 'secondary' : 'outline'} disabled={newCount === 0}>
          <span>New</span>
          <span>{newCount}</span>
        </Button>
        <Button onClick={() => onDeckSelect('AGAIN')} className="w-full justify-between" variant={activeDeck === 'AGAIN' ? 'secondary' : 'outline'} disabled={againCount === 0}>
          <span>Again</span>
          <span>{againCount}</span>
        </Button>
        <Button onClick={() => onDeckSelect('GOOD')} className="w-full justify-between" variant={activeDeck === 'GOOD' ? 'secondary' : 'outline'} disabled={goodCount === 0}>
          <span>Good</span>
          <span>{goodCount}</span>
        </Button>
      </div>
    </div>
  )
} 