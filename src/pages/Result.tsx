import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

export default function ResultPage() {
  const location = useLocation();
  const { currentScore = 0, quizCount = 10, correctBirds = [], currentQuestion} = location.state || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{currentScore} / {currentQuestion}</p> {/* 正解数 / 全問題数 */}
            <p className="text-xl text-gray-600">Great job!</p>
          </div>
          <Progress value={(currentScore / quizCount) * 100} className="w-full" /> {/* スコアの割合 */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-bold">Accuracy</p>
              <p>{((currentScore / quizCount) * 100).toFixed(1)}%</p> {/* 正解率 */}
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Birds You Identified Correctly:</h3>
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
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link to="/">Play Again</Link> {/* hrefをtoに修正 */}
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Share Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}