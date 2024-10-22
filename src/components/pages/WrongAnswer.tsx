import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { XCircle, AlertCircle, ArrowLeft, ArrowRight, PlayCircle, PauseCircle } from "lucide-react";
import BirdImage from "../ui/birdImage";  // 鳥の画像コンポーネント
import BirdDescription from "../ui/birdDescription";  // Wikipediaの鳥の説明コンポーネント

export default function IncorrectAnswerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { birdName, userAnswer, currentQuestion, quizCount, currentScore, birds, correctBirds, birdDetail, incorrectBirds } = location.state || {};  // stateから正解の鳥とユーザーの回答を取得
  const [sourceUrl, setSourceUrl] = useState(null);  // sourceUrlを状態として保存
  const [currentImageIndex, setCurrentImageIndex] = useState(0);  // 画像のインデックスを管理
  const [isPlaying, setIsPlaying] = useState(false);  // 再生状態を管理
  const audioRef = useRef<HTMLAudioElement | null>(null);  // 音声再生用のref

  // 画像とスペクトログラムの配列
  const images = [
    <BirdImage birdName={birdName} className="w-full h-full object-contain" />,  // 鳥の画像
    <div className="aspect-video bg-white rounded-lg overflow-hidden relative">
      <img
        src={birdDetail?.spectrogram || "/placeholder.svg"}
        alt="Spectrogram of bird song"
        className="w-full h-full object-contain"
      />
    </div>
  ];

  const handleNextQuestion = () => {
    if (currentQuestion < quizCount) {
      // 次の問題へ進む
      navigate('/quiz', { 
        state: { 
          currentQuestion: currentQuestion + 1,  // 次の問題へ
          quizCount,  // クイズの合計問題数
          currentScore,  // スコアはそのまま維持
          correctBirds,  // 正解した鳥のリストをそのまま引き継ぐ
          birds,  // 鳥のリスト
          incorrectBirds
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
          birds,
          incorrectBirds
        } 
      });
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center">
            {images[currentImageIndex]}  {/* 現在のインデックスに基づいて表示する画像 */}
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
              {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
            </Button>
            <audio ref={audioRef} src={birdDetail?.recording_url || ""} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">About the {birdName}</h3>
            <BirdDescription birdName={birdName} setSourceUrl={setSourceUrl} />  {/* 鳥の説明文を動的に表示し、URLをセット */}
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
                <span>Learn More</span>
              </a>
            ) : (
              <span>No source available</span>
            )}
          </Button>
          <Button onClick={handlePlayPause} variant="outline" className="flex items-center">
            {isPlaying ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
            Listen Again
          </Button>
          <Button onClick={handleNextQuestion} variant="outline">Next Question</Button>
        </CardFooter>
      </Card>
    </div>
  );
}