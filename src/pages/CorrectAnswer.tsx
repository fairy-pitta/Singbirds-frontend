import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CheckCircle, AlertCircle } from "lucide-react";
import BirdImage from "../components/ui/birdImage";  // 鳥の画像コンポーネント
import BirdDescription from "../components/ui/birdDescription";  // Wikipediaの鳥の説明コンポーネント

export default function CorrectAnswerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { birdName, currentQuestion, quizCount, currentScore, birds, correctBirds } = location.state || {}; // クイズ情報、スコア、鳥リストを受け取る
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);  // sourceUrlを状態として保存

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    // 鳥のリストが不足している場合、クイズ終了
    if (currentQuestion >= birds.length) {
      navigate('/result', { state: { currentScore, quizCount: birds.length, correctBirds, currentQuestion} });  // 問題数を鳥の数に合わせる
    } else if (currentQuestion < quizCount) {
      // 次の問題に進む
      navigate('/quiz', { state: { currentQuestion: nextQuestion, quizCount, currentScore, birds, correctBirds,} });
    } else {
      // クイズ終了
      navigate('/result', { state: { currentScore, quizCount, correctBirds, currentQuestion, birds} });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center text-green-500">
            <CheckCircle className="w-8 h-8 mr-2" />
            Correct! The bird is {birdName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">You correctly identified the {birdName}!</p>
          </div>
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <BirdImage birdName={birdName} />  {/* 鳥の画像を動的に表示 */}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">About the {birdName}</h3>
            <BirdDescription birdName={birdName} setSourceUrl={setSourceUrl} />  {/* 鳥の説明文を動的に表示し、URLをセット */}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Current Score: {currentScore}/{quizCount}</span>  {/* 動的なスコア表示 */}
            <span>Questions Remaining: {quizCount - currentQuestion}</span>
          </div>
          <Progress value={(currentQuestion / quizCount) * 100} className="w-full" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="flex items-center" asChild>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <AlertCircle className="w-4 h-4 mr-2" />
                Learn More
              </a>
            ) : (
              <span>No source available</span>
            )}
          </Button>
          <Button onClick={handleNextQuestion}>Next Question</Button>
        </CardFooter>
      </Card>
    </div>
  );
}