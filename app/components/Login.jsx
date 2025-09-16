import React from 'react'
import Image from "next/image";
import Link from "next/link";
const Login = () => {
  return (
     <div className="bg-[url(/bgimg.jpg)] flex items-center gap-6 justify-center flex-col h-[100vh]">
      <div className='flex flex-col gap-6'>
        <h1 className="text-white title text-6xl text-center font-bold ">
          AZƏRBAYCAN <br />
          MİNİATÜR SƏNƏTİ MUZEYİ
        </h1>
        <h2 className="text-white title text-6xl text-center">
          Museum of Azerbaijani Miniature Art
        </h2>
      </div>

      <Link
        href={"/puzzle"}
        className="text-white text-3xl bg-[#13CAFF] px-6 py-4 rounded-xl mt-6"
      >
        BAŞLA  /  START
      </Link>
      <div className="flex flex-col justify-center items-center">
        <span className="font-bold text-white">AZ</span>

        <p className="text-white text-center">
          Bu oyun Azərbaycan miniatür sənətindən ilhamlanaraq hazırlanmışdır.
          <br />
          <span className="text-[#13CAFF]">Başlamaq:</span> Oyun başladıqda
          miniatür təsviri kiçik hissələrə bölünmüş şəkildə görünəcək. <br />
          <span className="text-[#13CAFF]">Parçaların hərəkəti:</span>{" "}
          Barmağınızla toxunaraq parçanı seçin. Doğru yerə sürüşdürərək
          yerləşdirin.
          <br />
          <span className="text-[#13CAFF]">Düzgün uyğunluq:</span> Parça yerinə
          tam oturduqda səs və ya işıq effekti ilə təsdiqlənəcək. <br />
          <span className="text-[#13CAFF]">Oyunun sonu:</span> Bütün parçaları
          düzgün yerləşdirdikdə miniatür tam formalaşacaq və sənət əsərinin
          gözəlliyi ortaya çıxacaq.
          <br />
          <span className="text-[#13CAFF]">
            Bu puzzle sadəcə əyləncə deyil – həm də miniatür sənətinə
            yaxınlaşmaq, onun incəliklərini öyrənmək və zövq almaq üçün bir
            vasitədir.
          </span>
        </p>
      </div>
     <div className="flex flex-col justify-center items-center">
       <span className="font-bold text-white">EN</span>
      <p className="text-white text-center">
        This game is inspired by the art of Azerbaijani miniatures. <br />
        <span className="text-[#13CAFF]">Start:</span> When the game begins, the miniature image will
        appear divided into small pieces. <br />
        <span className="text-[#13CAFF]">Moving the pieces:</span> Tap a piece with your finger to select
        it. Drag and place it in the correct spot. <br />
        <span className="text-[#13CAFF]">Correct fit:</span> When a piece is placed correctly, it will be
        confirmed with a sound or light effect.
        <br />
        <span className="text-[#13CAFF]">Game completion:</span> Once all the pieces are correctly
        arranged, the miniature will be fully restored, revealing the beauty of
        the artwork.
        <br />
        <span className="text-[#13CAFF]">
          This puzzle is not only entertainment – it is also a way to connect
          with miniature art, discover its details, and enjoy its beauty.
        </span>
      </p>
     </div>
    </div>
  )
}

export default Login