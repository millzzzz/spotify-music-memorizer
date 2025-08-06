"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { useReviewStore } from "@/lib/store"
import { PlayButton } from "@/components/play-button"
import { AnswerButtons } from "@/components/answer-buttons"
import { ProgressBar } from "@/components/progress-bar"
import spotifyApi from "@/lib/spotify"
import { useLogStore } from "@/lib/log-store"
import { addToQueue } from "@/lib/spotify"
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCardProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  onReturn: () => void
}

export function ReviewCard({ showToast, onReturn }: ReviewCardProps) {
  const { 
    player, 
    deviceId, 
    isDeviceActive,
    cards, 
    currentId, 
    queue, 
    initialQueueSize, 
    isPlaying, 
    playbackStartTime, 
    setPlaybackState, 
    answer 
  } = useReviewStore()
  
  const { addLog } = useLogStore()
  const [progress, setProgress] = useState(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])

  const currentCard = currentId ? cards[currentId] : null

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateProgress = () => {
      if (isPlaying && playbackStartTime > 0) {
        const elapsed = (Date.now() - playbackStartTime) / 1000;
        const newProgress = (elapsed / 15) * 100;
        if (newProgress <= 100) {
          setProgress(newProgress);
        } else {
          setProgress(100);
        }
      } else {
        setProgress(0);
      }
    };

    if (isPlaying) {
      interval = setInterval(updateProgress, 100);
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, playbackStartTime]);

  useEffect(() => {
    if (queue.length > 1 && isDeviceActive) {
      const nextTrackId = queue[1];
      addToQueue(`spotify:track:${nextTrackId}`)
        .then(() => {
          addLog(`Pre-loading track ${nextTrackId} to the queue`, 'info');
        })
        .catch(err => {
          console.error('Failed to add to queue', err);
          addLog(`Failed to pre-load track ${nextTrackId}`, 'error');
        });
    }
  }, [queue, isDeviceActive, addLog]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => {
        if (player) {
          player.pause();
          setPlaybackState(false);
        }
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, player, setPlaybackState]);

  const handlePlayPause = useCallback(() => {
    if (!player || !deviceId || !currentCard || !isDeviceActive) return

    if (isPlaying) {
      player.pause().then(() => {
        setPlaybackState(false);
        showToast('Playback stopped', 'info')
        addLog(`Playback stopped for track ${currentCard.id}`, 'info')
      })
    } else {
      spotifyApi.play({
        device_id: deviceId,
        uris: [`spotify:track:${currentCard.id}`],
        position_ms: currentCard.playbackStartPosition,
      }).then(() => {
        setPlaybackState(true);
        showToast('Playing 15s clip...', 'info')
        addLog(`Playing track ${currentCard.id} from ${currentCard.playbackStartPosition}ms`, 'info')
      }).catch(err => {
        console.error("Playback failed", err);
        addLog(`Playback failed for track ${currentCard.id}`, 'error');
        showToast('Playback failed. Is another device playing?', 'error');
      });
    }
  }, [player, deviceId, currentCard, isPlaying, showToast, addLog, isDeviceActive, setPlaybackState])

  const handleAnswer = useCallback((userAnswer: 'again' | 'good') => {
    addLog(`Card ${currentId} answered as ${userAnswer}`, 'info')
    answer(userAnswer === 'good')

    if (userAnswer === 'again') {
      showToast('Marked as Again - will review soon', 'error')
    } else {
      showToast('Marked as Good - scheduled for later', 'success')
    }
  }, [currentId, answer, showToast, addLog])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          handlePlayPause()
          break
        case 'KeyJ':
          e.preventDefault()
          handleAnswer('again')
          break
        case 'KeyK':
          e.preventDefault()
          handleAnswer('good')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePlayPause, handleAnswer])

  if (!currentCard) {
    return <div className="w-full max-w-md text-center">Loading next card...</div>
  }
  
  const currentQueueIndex = initialQueueSize - queue.length + 1;

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={onReturn} variant="ghost" size="icon">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-sm text-gray-500">
          Card {currentQueueIndex} of {initialQueueSize}
        </div>
      </div>
      <motion.div
        drag="x"
        style={{ x, rotate }}
        dragConstraints={{ left: -200, right: 200 }}
        onDragEnd={(event, info) => {
          if (info.offset.x > 100) {
            handleAnswer('good')
          } else if (info.offset.x < -100) {
            handleAnswer('again')
          }
        }}
      >
        <div className="space-y-6">
          <div className="relative">
            <img
              src={currentCard.artworkUrl || "/placeholder.svg"}
              alt="Album artwork"
              className="w-64 h-64 mx-auto rounded-lg shadow-lg object-cover"
              width={256}
              height={256}
            />
            <PlayButton 
              isPlaying={isPlaying} 
              onToggle={handlePlayPause}
              className="absolute bottom-4 right-4"
            />
          </div>

          <ProgressBar progress={progress} />

          <AnswerButtons onAnswer={handleAnswer} />

          <div className="text-xs text-gray-400 text-center">
            <p>Space: Play/Pause • J: Again • K: Good</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
