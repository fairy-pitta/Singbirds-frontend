'use client'

import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { CheckCircle, AlertCircle, PlayCircle, PauseCircle, ArrowLeft, ArrowRight } from "lucide-react"
import BirdDescription from "../ui/birdDescription"
import BirdImage from "../ui/birdImage"

export default function CorrectAnswerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { birdName, currentQuestion, quizCount, currentScore, birds, correctBirds, incorrectBirds, birdDetail } = location.state || {}
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 画像のリスト（鳥の画像とスペクトログラム）
  const images = [
    <BirdImage birdName={birdName || "Unknown Bird"} className="w-full h-full object-contain" />, 
    birdDetail?.spectrogram ? (
      <div className="aspect-video bg-white rounded-lg overflow-hidden relative">
        <img
          src={birdDetail.spectrogram}
          alt="Spectrogram of bird song"
          className="w-full h-full object-contain"
        />
      </div>
    ) : (
      <div className="flex justify-center items-center text-gray-500">Spectrogram not available</div>
    )
  ]

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1
    if (currentQuestion >= birds.length) {
      navigate('/result', { state: { currentScore, quizCount: birds.length, correctBirds, incorrectBirds, currentQuestion } })
    } else if (currentQuestion < quizCount) {
      navigate('/quiz', { state: { currentQuestion: nextQuestion, quizCount, currentScore, birds, correctBirds, incorrectBirds } })
    } else {
      navigate('/result', { state: { currentScore, quizCount, correctBirds, currentQuestion, birds, incorrectBirds } })
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center text-green-500">
            <CheckCircle className="w-8 h-8 mr-2" />
            Correct! The bird is {birdName || "Unknown Bird"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">You correctly identified the {birdName || "Unknown Bird"}!</p>
          </div>
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center">
            {images[currentImageIndex]}
            <Button
              onClick={handlePrevImage}
              variant="outline"
              size="icon"
              className="absolute left-4 w-12 h-12 rounded-full bg-white/80"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleNextImage}
              variant="outline"
              size="icon"
              className="absolute right-4 w-12 h-12 rounded-full bg-white/80"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/80"
            >
              {isPlaying ? (
                <PauseCircle className="h-6 w-6" />
              ) : (
                <PlayCircle className="h-6 w-6" />
              )}
            </Button>
            <audio ref={audioRef} src={birdDetail?.recording_url} onEnded={() => setIsPlaying(false)} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">About the {birdName || "Unknown Bird"}</h3>
            <BirdDescription birdName={birdName || "Unknown Bird"} setSourceUrl={setSourceUrl} />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Current Score: {currentScore}/{quizCount}</span>
            <span>Questions Remaining: {quizCount - currentQuestion}</span>
          </div>
          <Progress value={(currentQuestion / quizCount) * 100} className="w-full" />
        </CardContent>
        <CardFooter className="flex justify-between">
        <Button variant="outline" className="flex items-center space-x-2" asChild>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>More</span>
              </a>
            ) : (
              <span>No source available</span>
            )}
          </Button>
          <Button onClick={handlePlayPause} variant="outline" className="flex items-center">
            {isPlaying ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
            Listen
          </Button>
          <Button onClick={handleNextQuestion} variant="outline">Next</Button>
        </CardFooter>
      </Card>
    </div>
  )
}