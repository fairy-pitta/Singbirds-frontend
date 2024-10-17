import React, { useEffect, useState } from 'react';

const BirdImage = ({ birdName }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Wikimediaの検索APIで鳥のWikipediaページを検索
        const searchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(birdName)}&limit=1&namespace=0&format=json&origin=*`
        );
        const searchData = await searchResponse.json();

        // 検索結果があれば、ページタイトルを取得
        if (searchData[1].length > 0) {
          const pageTitle = searchData[1][0];

          // Wikipediaページの画像を取得するAPIを呼び出す
          const imageResponse = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(pageTitle)}&pithumbsize=500&format=json&origin=*`
          );
          const imageData = await imageResponse.json();
          const pages = imageData.query.pages;

          // 画像URLを取得
          const page = Object.values(pages)[0];
          if (page.thumbnail) {
            setImageUrl(page.thumbnail.source);
          }
        }
      } catch (error) {
        console.error('Failed to fetch bird image:', error);
      }
    };

    fetchImage();
  }, [birdName]);

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={birdName}
          className="w-full h-full object-contain"  // object-fit: contain を使用
        />
      ) : (
        <p>No image available</p>
      )}
    </div>
  );
};

export default BirdImage;