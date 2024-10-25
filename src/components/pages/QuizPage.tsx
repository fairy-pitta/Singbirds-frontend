import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { PlayCircle, PauseCircle } from "lucide-react";

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotspotId, quizCount = 10, currentQuestion = 1, currentScore = 0, birds: initialBirds = [], correctBirds = [], incorrectBirds = [] } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [birds, setBirds] = useState(initialBirds);
  const [currentBird, setCurrentBird] = useState<any>(null);
  const [birdDetail, setBirdDetail] = useState<any>(null);
  const [choices, setChoices] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchBirds = useCallback(async () => {
    try {
      const response = await fetch(`https://api.singbirds.net/api/hotspots/${hotspotId}/birds/`);
      const data = await response.json();

      if (!data.birds || data.birds.length === 0) {
        navigate('/result', { state: { currentScore, quizCount: 0, correctBirds: [], incorrectBirds: []} });
        return;
      }

      const selectedBirds = data.birds.sort(() => 0.5 - Math.random()).slice(0, quizCount);
      setBirds(selectedBirds);
      setCurrentBird(selectedBirds[0]);
    } catch (error) {
      console.error("Failed to fetch bird data", error);
      navigate('/result', { state: { currentScore, quizCount: 0, correctBirds: [], incorrectBirds: [] } });
    }
  }, [hotspotId, navigate, currentScore, quizCount]);

  useEffect(() => {
    if (birds.length === 0) {
      fetchBirds();
    } else if (currentQuestion <= birds.length) {
      setCurrentBird(birds[currentQuestion - 1]);
    }
  }, [birds, currentQuestion, fetchBirds]);

  useEffect(() => {
    let isMounted = true;

    const fetchBirdDetail = async () => {
      if (!currentBird || !currentBird.bird_id) return;

      try {
        const response = await fetch(`https:/api.singbirds.net/api/birds/${currentBird.bird_id}/random-detail/`);
        const data = await response.json();

        if (!data.bird_detail || !data.bird_detail.recording_url) {
          console.error("bird_detail or recording_url not found.");
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
          } else {
            console.log("Max retries reached. Moving to next bird.");
            navigateNextBird();
          }
          return;
        }

        const spectrogramUrl = data.bird_detail.spectrogram.startsWith('/')
          ? `https://api.singbirds.net${data.bird_detail.spectrogram}`
          : data.bird_detail.spectrogram;

        if (isMounted) {
          setBirdDetail({
            ...data.bird_detail,
            bird_id: currentBird.bird_id,
            comName: currentBird.comName,
            spectrogram: spectrogramUrl,
          });
        }
      } catch (error) {
        console.error("Failed to fetch bird detail", error);
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
        } else {
          console.log("Max retries reached. Moving to next bird.");
          navigateNextBird();
        }
      }
    };

    if (currentBird?.bird_id) {
      fetchBirdDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [currentBird, retryCount]);

  const navigateNextBird = useCallback(() => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion <= quizCount) {
      setCurrentBird(birds[nextQuestion - 1]);
    } else {
      navigate('/result', { state: { currentScore, quizCount, correctBirds, incorrectBirds } });
    }
  }, [currentQuestion, quizCount, birds, navigate, currentScore, correctBirds, incorrectBirds]);

  useEffect(() => {
    if (birds.length > 0 && currentBird) {
      const otherBirds = birds.filter(bird => bird.bird_id !== currentBird.bird_id);
      const randomChoices = otherBirds.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allChoices = [...randomChoices, currentBird];
      setChoices(allChoices.sort(() => 0.5 - Math.random()));
    }
  }, [currentBird, birds]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    const nextQuestion = currentQuestion;

    if (selectedAnswer === currentBird.comName) {
      if (nextQuestion <= quizCount) {
        navigate('/right', { 
          state: { 
            birdName: currentBird.comName, 
            currentQuestion: nextQuestion, 
            quizCount,  
            currentScore: currentScore + 1,  
            correctBirds: [...correctBirds, currentBird.comName], 
            incorrectBirds,
            birds,
            birdDetail
          } 
        });
      } else {
        navigate('/result', { state: { currentScore: currentScore + 1, quizCount, correctBirds: [...correctBirds, currentBird.comName] } });
      }
    } else {
      if (nextQuestion <= quizCount) {
        navigate('/wrong', { 
          state: { 
            birdName: currentBird.comName, 
            userAnswer: selectedAnswer, 
            currentQuestion: nextQuestion,  
            quizCount,  
            currentScore,  
            correctBirds,  
            incorrectBirds: [...incorrectBirds, currentBird.comName],
            birds,
            birdDetail,
          } 
        });
      } else {
        navigate('/result', { state: { currentScore, quizCount, correctBirds, incorrectBirds } });
      }
    }
  };

  if (!currentBird || !birdDetail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Identify the Bird</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
          {choices.map((bird: any) => (
            <Button
              key={bird.bird_id}
              variant={selectedAnswer === bird.comName ? "default" : "outline"}
              className={`text-lg py-6 ${
                selectedAnswer === bird.comName
                  ? 'bg-green-500 text-white hover:bg-green-500 hover:text-white' // 押されたときに緑になる
                  : 'hover:bg-gray-200'  // 押されていないときのホバースタイル
              }`}
              onClick={() => handleAnswerSelect(bird.comName)}
            >
              {bird.comName}
            </Button>
          ))}
        </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion} of {quizCount}</span>
          </div>
          <Progress value={(currentQuestion / quizCount) * 100} className="w-full" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!selectedAnswer}>Submit Answer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}