import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { PlayCircle, PauseCircle } from "lucide-react";

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotspotId, quizCount = 10, currentQuestion = 1, currentScore = 0, birds: initialBirds = [], correctBirds = [] } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [birds, setBirds] = useState(initialBirds); 
  const [currentBird, setCurrentBird] = useState(birds[0]);  // 最初の鳥を設定
  const [birdDetail, setBirdDetail] = useState(null); 
  const [choices, setChoices] = useState([]);  
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchBirds = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/hotspots/${hotspotId}/birds/`);
      const data = await response.json();
  
      if (!data.birds || data.birds.length === 0) {
        navigate('/result', { state: { currentScore, quizCount: 0, correctBirds: [] } });
        return;
      }
  
      const selectedBirds = data.birds.sort(() => 0.5 - Math.random()).slice(0, quizCount); // ランダムに鳥を選ぶ
      setBirds(selectedBirds);
      setCurrentBird(selectedBirds[0]); // 最初の鳥を設定
    } catch (error) {
      console.error("鳥データの取得に失敗しました", error);
      navigate('/result', { state: { currentScore, quizCount: 0, correctBirds: [] } });
    }
  }, [hotspotId, navigate, currentScore, quizCount]);
  
  useEffect(() => {
    if (birds.length === 0) {
      fetchBirds();  // 鳥リストを取得
    }
  }, [fetchBirds]);

  // `currentQuestion`が変わったら次の鳥に更新
  useEffect(() => {
    if (currentQuestion <= birds.length) {
      setCurrentBird(birds[currentQuestion - 1]); // currentQuestionに基づいて次の鳥を設定
    }
  }, [currentQuestion, birds]);

  useEffect(() => {
    console.log("Current Bird:", currentBird);
  }, [currentBird]);

  useEffect(() => {
    let isMounted = true; // A flag to track if the component is still mounted
    let isLoading = false; // A flag to track if we are currently fetching data
  
    const fetchBirdDetail = async () => {
      // Prevent fetching if we are already loading or there's no valid bird ID
      if (isLoading || !currentBird || !currentBird.bird_id) return;
  
      isLoading = true; // Mark as loading before fetch starts
  
      try {
        // Fetch bird details from API
        const response = await fetch(`http://localhost:8000/api/birds/${currentBird.bird_id}/random-detail/`);
        const data = await response.json();
  
        // Check if bird_detail exists
        if (!data.bird_detail) {
          console.error("bird_detailが見つかりません。結果ページへ遷移します。");
          if (isMounted) {
            navigate('/result', { state: { currentScore, quizCount, correctBirds } });
          }
          return;
        }
  
        // Check if bird_id matches currentBird's bird_id
        if (data.bird_detail.bird_id !== currentBird.bird_id) {
          console.error(`データの不一致: currentBird.bird_id (${currentBird.bird_id}) と data.bird_detail.bird_id (${data.bird_detail.bird_id}) が一致しません`);
          if (isMounted) {
            navigate('/result', { state: { currentScore, quizCount, correctBirds } });
          }
          return;
        }
  
        // Check if recording_url exists
        if (!data.bird_detail.recording_url) {
          console.error("recording_urlが見つかりません。結果ページへ遷移します。");
          if (isMounted) {
            navigate('/result', { state: { currentScore, quizCount, correctBirds } });
          }
          return;
        }
  
        // Correct spectrogram URL formatting
        const spectrogramUrl = data.bird_detail.spectrogram.startsWith('/')
          ? `http://localhost:8000${data.bird_detail.spectrogram}`
          : data.bird_detail.spectrogram;
  
        // If component is still mounted, update birdDetail
        if (isMounted) {
          setBirdDetail({
            ...data.bird_detail,
            bird_id: currentBird.bird_id,
            comName: currentBird.comName,
            spectrogram: spectrogramUrl,
          });
        }
  
      } catch (error) {
        console.error("鳥の詳細情報の取得に失敗しました", error);
        if (isMounted) {
          navigate('/result', { state: { currentScore, quizCount, correctBirds } });
        }
      } finally {
        isLoading = false; // Reset loading flag after fetch is complete
      }
    };
  
    if (currentBird?.bird_id) {
      fetchBirdDetail(); // Fetch bird detail only if currentBird is valid and has a bird_id
    }
  
    // Cleanup function to ensure that the effect doesn't run when the component is unmounted
    return () => {
      isMounted = false; // Mark component as unmounted
    };
  
  }, [currentBird?.bird_id]); // Re-run effect only when currentBird's bird_id changes
  
  // 状態更新後のログ出力
  useEffect(() => {
    console.log("birdDetailが更新されました(kore):", birdDetail);
  }, [birdDetail]);
  

  // 選択肢の生成
  useEffect(() => {
    if (birds.length > 0 && currentBird) {
      const otherBirds = birds.filter(bird => bird.bird_id !== currentBird.bird_id);  // 正解以外の鳥
      const randomChoices = otherBirds.sort(() => 0.5 - Math.random()).slice(0, 3);  // ランダムに3つ選ぶ
      const allChoices = [...randomChoices, currentBird];  // 正解の鳥を含める
      setChoices(allChoices.sort(() => 0.5 - Math.random()));  // 選択肢をシャッフル
    }
  }, [currentBird, birds]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    const nextQuestion = currentQuestion;  // 次の問題
    console.log("currentBird:", currentBird);
    console.log("birdDetail:", birdDetail);

    if (selectedAnswer === currentBird.comName) {
      // 正解時、次の鳥を設定
      if (nextQuestion <= quizCount) {
        navigate('/right', { 
          state: { 
            birdName: currentBird.comName, 
            currentQuestion: nextQuestion,  // 次の問題へ
            quizCount,  
            currentScore: currentScore + 1,  // スコアを加算
            correctBirds: [...correctBirds, currentBird.comName],  
            birds  
          } 
        });
      } else {
        // 最後の問題に達したら結果ページへ遷移
        navigate('/result', { state: { currentScore: currentScore + 1, quizCount, correctBirds: [...correctBirds, currentBird.comName] } });
      }
    } else {
      // 不正解時
      if (nextQuestion <= quizCount) {
        navigate('/wrong', { 
          state: { 
            birdName: currentBird.comName, 
            userAnswer: selectedAnswer, 
            currentQuestion: nextQuestion,  // 次の問題へ
            quizCount,  
            currentScore,  // スコアはそのまま
            correctBirds,  
            birds  
          } 
        });
      } else {
        // 最後の問題に達したら結果ページへ遷移
        navigate('/result', { state: { currentScore, quizCount, correctBirds } });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Identify the Bird</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentBird && birdDetail && (
            <>
              <div className="aspect-video bg-white rounded-lg overflow-hidden relative">
                <img
                  src={birdDetail.spectrogram}  
                  alt="Spectrogram of bird song"
                  className="w-full h-full object-contain"  
                />
                <Button
                  onClick={() => {
                    if (isPlaying) {
                      audioRef.current?.pause(); 
                    } else {
                      audioRef.current?.play();  
                    }
                    setIsPlaying(!isPlaying);  
                  }}
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
                <audio ref={audioRef}>
                  <source src={birdDetail.recording_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {choices.map((bird) => (
                  <Button
                    key={bird.bird_id}
                    variant={selectedAnswer === bird.comName ? "default" : "outline"}
                    className="text-lg py-6"
                    onClick={() => handleAnswerSelect(bird.comName)}
                  >
                    {bird.comName}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Question {currentQuestion} of {quizCount}</span>
              </div>
              <Progress value={(currentQuestion / quizCount) * 100} className="w-full" />
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" disabled={currentQuestion === 1}>Previous</Button>
          <Button onClick={handleSubmit} disabled={!selectedAnswer}>Submit Answer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}