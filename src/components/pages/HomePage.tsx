import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [country, setCountry] = useState("Singapore");
  const [habitat, setHabitat] = useState(""); // habitatの初期値は空に設定
  const [quizCount, setQuizCount] = useState(10);
  const [hotspots, setHotspots] = useState([]); // APIから取得するホットスポットのデータ
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [maxSliderValue, setMaxSliderValue] = useState(10); // スライダーの初期最大値
  const navigate = useNavigate();

  // APIリクエストでホットスポットを取得
  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await fetch("https://api.singbirds.net/api/hotspots/");
        const data = await response.json();
        setHotspots(data); // データを状態に保存
      } catch (error) {
        console.error("ホットスポットデータの取得に失敗しました", error);
      }
    };

    fetchHotspots();
  }, []);

  useEffect(() => {
    const fetchBirds = async () => {
      if (selectedHotspot) {
        try {
          const response = await fetch(`https://api.singbirds.net/api/hotspots/${selectedHotspot.hotspot_id}/birds/`);
          const new_data = await response.json();
  
  
          if (Array.isArray(new_data.birds)) {
            const birdCount = new_data.birds.length;
            setMaxSliderValue(birdCount > 0 ? birdCount : 10);
            setQuizCount(Math.min(quizCount, birdCount)); // クイズ数を鳥の数以下に制限
          } else {
            console.error("無効な鳥データが取得されました");
            setMaxSliderValue(10);
          }
        } catch (error) {
          console.error("鳥データの取得に失敗しました", error);
          setMaxSliderValue(10);
        }
      }
    };
  
    fetchBirds();
  }, [selectedHotspot]);

  // クイズを開始するボタンの処理
  const handleStartQuiz = () => {
    if (selectedHotspot) {
      navigate("/quiz", {
        state: { country, habitat, quizCount, hotspotId: selectedHotspot.hotspot_id }
      });
    } else {
      alert("Please select a hotspot.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center flex items-center justify-center">
            <img src="/favicon.ico" alt="Logo" className="w-16 h-16 mr-4" />
            SingBirds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-center">
            Listen to bird songs and identify the species!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Select Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60 overflow-y-auto">
                  <SelectItem value="Singapore">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="habitat">Hotspot</Label>
              <Select value={habitat} onValueChange={(value) => {
                setHabitat(value);
                const hotspot = hotspots.find((h) => h.locName === value);
                setSelectedHotspot(hotspot);
              }}>
                <SelectTrigger id="habitat">
                  <SelectValue placeholder="Select a habitat" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60 overflow-y-auto">
                  {hotspots.map((hotspot) => (
                    <SelectItem key={hotspot.hotspot_id} value={hotspot.locName}>
                      {hotspot.locName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 質問数を選択するスライダー */}
          <div className="space-y-2">
            <Label htmlFor="quiz-count">Number of Questions: {quizCount}</Label>
            <Slider
              id="quiz-count"
              min={1}
              max={maxSliderValue}  // 鳥の数に基づく最大値
              step={1}
              value={[quizCount]}
              onValueChange={(value) => setQuizCount(value[0])}  // スライダーの値を更新
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-bold">How to Play:</h3>
              <ul className="list-disc list-inside text-sm">
                <li>Listen to the bird song</li>
                <li>Examine the spectrogram</li>
                <li>Choose the correct bird species</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Features:</h3>
              <ul className="list-disc list-inside text-sm">
                <li>Beautiful bird songs</li>
                <li>Visual spectrograms</li>
                <li>Learn while having fun</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="w-full sm:w-auto bg-white text-black border-2 border-black py-3 px-6 rounded-lg shadow-md hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}