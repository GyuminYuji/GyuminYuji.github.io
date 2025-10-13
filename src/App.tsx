import { Cover } from "./component/cover"
import { Location } from "./component/location"
import "./App.scss"
import { BGEffect } from "./component/bgEffect"
import { Invitation } from "./component/invitation"
import { Calendar } from "./component/calendar"
import { Gallery } from "./component/gallery"
import { Information } from "./component/information"
import { GuestBook } from "./component/guestbook"
import { LazyDiv } from "./component/lazyDiv"
import { ShareButton } from "./component/shareButton"
import { STATIC_ONLY } from "./env"
import { useState, useRef, useEffect } from "react"
import musicURL from "./assets/background-music.mp3"

// SVG 아이콘 컴포넌트 정의
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  // 사용자의 첫 상호작용이 있었는지 추적하기 위한 ref
  const hasInteracted = useRef(false)

  // 컴포넌트가 마운트될 때 첫 상호작용을 감지하는 이벤트 리스너를 설정합니다.
  useEffect(() => {
    const playMusicOnFirstInteraction = () => {
      // 이미 상호작용이 있었거나 오디오가 준비되지 않았다면 아무것도 하지 않습니다.
      if (hasInteracted.current || !audioRef.current) return

      audioRef.current.play().catch((error) => {
        // 자동 재생 실패는 흔한 경우이므로, 콘솔에만 기록합니다.
        console.error("음악 자동 재생에 실패했습니다.", error)
      })
      setIsPlaying(true)
      hasInteracted.current = true // 상호작용이 있었음을 기록

      // 이벤트 리스너를 한 번만 실행하고 제거합니다.
      document.removeEventListener("click", playMusicOnFirstInteraction)
      document.removeEventListener("touchstart", playMusicOnFirstInteraction)
    }

    // 클릭 또는 터치 이벤트를 감지합니다.
    document.addEventListener("click", playMusicOnFirstInteraction)
    document.addEventListener("touchstart", playMusicOnFirstInteraction)

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      document.removeEventListener("click", playMusicOnFirstInteraction)
      document.removeEventListener("touchstart", playMusicOnFirstInteraction)
    }
  }, []) // 이 useEffect는 한 번만 실행됩니다.

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    const nextIsPlaying = !isPlaying
    setIsPlaying(nextIsPlaying)

    if (nextIsPlaying) {
      // play()는 Promise를 반환하며, 사용자가 상호작용하기 전에 호출되면 실패할 수 있습니다.
      audio.play().catch((error) => {
        console.error("음악 재생에 실패했습니다.", error)
        // 재생에 실패하면, UI 상태를 다시 false로 동기화합니다.
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }

  return (
    <div className="background">
      {/* 배경음악 오디오 요소 */}
      <audio ref={audioRef} src={musicURL} loop />

      {/* 재생/일시정지 버튼: SVG 아이콘과 애니메이션 클래스 적용 */}
      <button
        className={`music-button ${isPlaying ? "playing" : ""}`}
        onClick={togglePlay}
        aria-label="음악 재생/일시정지"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <BGEffect />
      <div className="card-view">
        <LazyDiv className="card-group">
          {/* 표지 */}
          <Cover />

          {/* 모시는 글 */}
          <Invitation />
        </LazyDiv>

        <LazyDiv className="card-group">
          {/* 결혼식 날짜 (달력) */}
          <Calendar />

          {/* 겔러리 */}
          <Gallery />
        </LazyDiv>

        <LazyDiv className="card-group">
          {/* 오시는길 */}
          <Location />
        </LazyDiv>

        <LazyDiv className="card-group">
          {/* 마음 전하기 */}
          <Information />
          {/* 방명록 */}
          {!STATIC_ONLY && <GuestBook />}
        </LazyDiv>

        <ShareButton />
      </div>
    </div>
  )
}

export default App
