import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import BirdImage from "../components/ui/birdImage";  // 鳥の画像コンポーネント
import BirdDescription from "../components/ui/birdDescription";  // Wikipediaの鳥の説明コンポーネント

export default function IncorrectAnswerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { birdName, userAnswer, currentQuestion, quizCount, currentScore, birds, correctBirds} = location.state || {};  // stateから正解の鳥とユーザーの回答を取得
  const [sourceUrl, setSourceUrl] = useState(null);  // sourceUrlを状態として保存

  const handleNextQuestion = () => {
    if (currentQuestion < quizCount) {
      // 次の問題へ進む
      navigate('/quiz', { 
        state: { 
          currentQuestion: currentQuestion + 1,  // 次の問題へ
          quizCount,  // クイズの合計問題数
          currentScore,  // スコアはそのまま維持
          correctBirds,  // 正解した鳥のリストをそのまま引き継ぐ
          birds  // 鳥のリストを維持
        } 
      });
    } else {
      // クイズ終了時は結果ページへ
      navigate('/result', { 
        state: { 
          currentScore,  // 現在のスコアを結果ページに渡す
          quizCount,  // クイズの合計問題数
          correctBirds,  // 正解した鳥のリストを結果ページに渡す
          currentQuestion,
          birds
        } 
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center text-red-500">
            <XCircle className="w-8 h-8 mr-2" />
            Sorry! That's incorrect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">Correct Answer: {birdName}</p> {/* 正解の鳥の名前 */}
            <p className="text-gray-600">Your Answer: {userAnswer}</p> {/* ユーザーの回答 */}
          </div>
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <BirdImage birdName={birdName} />  {/* 鳥の画像を動的に表示 */}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">About the {birdName}</h3>
            <BirdDescription birdName={birdName} setSourceUrl={setSourceUrl} />  {/* 鳥の説明文を動的に表示し、URLをセット */}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Current Score: {currentScore}/{quizCount}</span>
          <span>Questions Remaining: {quizCount - currentQuestion}</span>
          </div>
          <Progress value={70} className="w-full" />
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