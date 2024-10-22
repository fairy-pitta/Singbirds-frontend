import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"

export default function ResultPage() {
  const location = useLocation()
  const { currentScore = 0, quizCount = 10, correctBirds = [], incorrectBirds = [], currentQuestion } = location.state || {}

  const getLevel = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 95) return "Bird Guru"
    if (percentage >= 85) return "Bird Master"
    if (percentage >= 75) return "Advanced Birder"
    if (percentage >= 65) return "Expert Birder"
    if (percentage >= 55) return "Skilled Observer"
    if (percentage >= 45) return "Keen Birdwatcher"
    if (percentage >= 35) return "Budding Birder"
    if (percentage >= 25) return "Amateur Spotter"
    if (percentage >= 15) return "Curious Novice"
    return "Novice Birdwatcher"
  }

  const level = getLevel(currentScore, (correctBirds?.length || 0) + (incorrectBirds?.length || 0));
  const accuracy = ((currentScore / ((correctBirds?.length || 0) + (incorrectBirds?.length || 0))) * 100).toFixed(1);
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{currentScore} / {(correctBirds?.length || 0) + (incorrectBirds?.length || 0)}</p>
            <p className="text-xl text-gray-600">Great job!</p>
          </div>
          <Progress value={(currentScore / quizCount) * 100} className="w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-bold">Accuracy</p>
              <p>{accuracy}%</p>
            </div>
            <div>
              <p className="font-bold">Your Level</p>
              <p className="text-primary">{level}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Correctly Identified Birds:</h3>
              {correctBirds.length > 0 ? (
                <ul className="list-disc list-inside">
                  {correctBirds.map((bird, index) => (
                    <li key={index}>{bird}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No birds identified correctly</p>
              )}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Incorrectly Identified Birds:</h3>
              {incorrectBirds.length > 0 ? (
                <ul className="list-disc list-inside">
                  {incorrectBirds.map((bird, index) => (
                    <li key={index}>{bird}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No birds identified incorrectly</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <Link to="/">Play Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}