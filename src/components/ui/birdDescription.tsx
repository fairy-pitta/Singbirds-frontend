import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';

interface BirdDescriptionProps {
  birdName: string;
  setSourceUrl: Dispatch<SetStateAction<string | null>>;  // setSourceUrlの型を追加
}

const BirdDescription: React.FC<BirdDescriptionProps> = ({ birdName, setSourceUrl }) => {
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    const fetchBirdDescription = async () => {
      try {
        const searchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(birdName)}&limit=1&namespace=0&format=json&origin=*`
        );
        const searchData = await searchResponse.json();
        const pageTitle = searchData[1][0];
        const pageUrl = searchData[3][0];  // WikipediaページのURL

        if (pageTitle) {
          const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`
          );
          const data = await response.json();

          // ページの中身を取得してextractにアクセス
          const pages = data.query.pages;
          const page = Object.values(pages)[0]; // 動的にページIDにアクセス
          if (page && page.extract) {
            setDescription(page.extract);  // HTMLとしての説明を設定
            setSourceUrl(pageUrl);  // 親にURLを設定
          } else {
            setDescription('Description not available.');
            setSourceUrl(null); // URLがない場合
          }
        } else {
          setDescription('No Wikipedia page found for this bird.');
          setSourceUrl(null); // URLがない場合
        }
      } catch (error) {
        console.error('Failed to fetch bird description:', error);
        setDescription('Failed to fetch description.');
        setSourceUrl(null); // エラーが発生した場合もURLなし
      }
    };

    if (birdName) {
      fetchBirdDescription();
    }
  }, [birdName, setSourceUrl]);

  return (
    <div
      style={{
        maxHeight: '300px',  // 固定の高さ
        overflowY: 'auto',   // コンテンツが溢れた場合にスクロール
        padding: '10px',
        borderRadius: '5px'
      }}
    >
      {description ? (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p>Loading description...</p>
      )}
    </div>
  );
};

export default BirdDescription;