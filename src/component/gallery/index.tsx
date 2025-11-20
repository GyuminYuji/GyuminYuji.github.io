import { useCallback, useEffect, useState, useRef, memo } from "react"
import { useModal } from "../modal"
import { GALLERY_IMAGES } from "../../images"

// 사진 그리드만 렌더링하는 순수한 컴포넌트를 분리하고 React.memo로 감쌉니다.
const GalleryGrid = memo(
  ({ onPhotoClick }: { onPhotoClick: (index: number) => void }) => {
    console.log("Rendering GalleryGrid"); // 이 로그는 이제 한 번만 보여야 합니다.
    return (
      <div className="photo-grid">
        {GALLERY_IMAGES.map((image, idx) => {
          return (
            <div
              key={idx}
              className="photo-grid-item"
              onClick={() => onPhotoClick(idx)}
            >
              <img
                src={image}
                alt={`Photo ${idx + 1}`}
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    );
  },
);

// 메인 Gallery 컴포넌트
export const Gallery = () => {
  const { openModal, closeModal } = useModal()

  // 임시로 preload 기능 주석 처리
  /*
  useEffect(() => {
    // preload images
    GALLERY_IMAGES.forEach((image) => {
      const img = new Image()
      img.src = image
    })
  }, [])
  */

  // 개별 사진 확대 보기를 위한 함수
  const openPhotoModal = useCallback((photoIndex: number) => {
    const PhotoViewer = () => {
      console.log(`PhotoViewer is rendering. Current index: ${photoIndex}`);
      const [currentIndex, setCurrentIndex] = useState(photoIndex)

      const startX = useRef(0)
      const startY = useRef(0)
      // deltaX, deltaY를 state가 아닌 ref로 변경하여 리렌더링 방지
      const deltaX = useRef(0)
      const deltaY = useRef(0)
      const isDragging = useRef(false)
      const dragDirection = useRef<'horizontal' | 'vertical' | null>(null)

      // 멀티 터치 여부 추적하는 ref 추가
      const isMultiTouch = useRef(false)

      // 인디케이터 자동 스크롤을 위한 ref
      const indicatorRefs = useRef<(HTMLButtonElement | null)[]>([])

      // currentIndex가 변경될 때마다 해당 인디케이터로 스크롤
      useEffect(() => {
        const activeIndicator = indicatorRefs.current[currentIndex]
        if (activeIndicator) {
          activeIndicator.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      }, [currentIndex])

      const goToPrevious = () => {
        const newIndex = (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        setCurrentIndex(newIndex)
      }

      const goToNext = () => {
        const newIndex = (currentIndex + 1) % GALLERY_IMAGES.length
        setCurrentIndex(newIndex)
      }

      const handleTouchStart = (e: React.TouchEvent) => {
        // 손가락 개수에 따른 멀티 터치 여부 판단
        if (e.touches.length > 1) {
          isMultiTouch.current = true
        } else {
          isMultiTouch.current = false
        }

        if (e.touches.length === 1) {
          startX.current = e.touches[0].clientX
          startY.current = e.touches[0].clientY
          // 드래그 시작 시 delta 값 초기화
          deltaX.current = 0
          deltaY.current = 0
          isDragging.current = false
          dragDirection.current = null
        }
      }

      const handleTouchMove = (e: React.TouchEvent) => {
        // [수정] 움직이는 도중에도 손가락이 2개 이상이면 멀티 터치로 플래그 설정
        if (e.touches.length > 1) {
          isMultiTouch.current = true
          return // 줌 동작 중에는 스와이프 로직 계산 방지
        }

        if (e.touches.length === 1) {
          // state를 업데이트하는 대신 ref의 현재 값만 변경
          deltaX.current = e.touches[0].clientX - startX.current
          deltaY.current = e.touches[0].clientY - startY.current

          if (!isDragging.current && dragDirection.current === null) {
            if (Math.abs(deltaX.current) > 10 || Math.abs(deltaY.current) > 10) {
              if (Math.abs(deltaX.current) > Math.abs(deltaY.current)) {
                dragDirection.current = 'horizontal'
                isDragging.current = true
              } else {
                dragDirection.current = 'vertical'
                isDragging.current = true
              }
            }
          }
        }
      }

      const handleTouchEnd = (e: React.TouchEvent) => {
        // [추가] 줌(멀티 터치) 동작이 있었다면 닫기 로직을 실행하지 않음
        if (isMultiTouch.current) {
          isMultiTouch.current = false // (선택) 상태 리셋
          return
        }

        // 2. [추가] 화면이 확대(Zoom)된 상태라면 스와이프/닫기 동작 차단
        // visualViewport.scale이 1보다 크면 확대된 상태입니다. (약간의 오차 허용 1.05)
        if (window.visualViewport && window.visualViewport.scale > 1.05) {
          isDragging.current = false
          dragDirection.current = null
          return
        }

        if (dragDirection.current === 'horizontal' && isDragging.current) {
          // 터치가 끝났을 때 최종 deltaX 값으로 판단
          if (Math.abs(deltaX.current) > 50) {
            if (deltaX.current > 0) goToPrevious()
            else goToNext()
          }
        } else if (!isDragging.current && dragDirection.current !== 'horizontal') {
          if (e.cancelable) e.preventDefault()
          closeModal()
        }

        isDragging.current = false
        dragDirection.current = null
      }

      const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX
        startY.current = e.clientY
        // 드래그 시작 시 delta 값 초기화
        deltaX.current = 0
        deltaY.current = 0
        isDragging.current = false
        dragDirection.current = null
      }

      const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons === 1) { // 마우스 버튼이 눌린 상태에서만
          // state를 업데이트하는 대신 ref의 현재 값만 변경
          deltaX.current = e.clientX - startX.current
          deltaY.current = e.clientY - startY.current

          if (!isDragging.current && dragDirection.current === null) {
            if (Math.abs(deltaX.current) > 10 || Math.abs(deltaY.current) > 10) {
              if (Math.abs(deltaX.current) > Math.abs(deltaY.current)) {
                dragDirection.current = 'horizontal'
                isDragging.current = true
              } else {
                dragDirection.current = 'vertical'
              }
            }
          }
        }
      }

      const handleMouseUp = (e: React.MouseEvent) => {
        if (dragDirection.current === 'horizontal' && isDragging.current) {
          e.preventDefault()
          // 마우스 버튼을 뗐을 때 최종 deltaX 값으로 판단
          const finalDeltaX = e.clientX - startX.current

          if (Math.abs(finalDeltaX) > 50) {
            if (finalDeltaX > 0) goToPrevious()
            else goToNext()
          }
        } else if (!isDragging.current && dragDirection.current !== 'horizontal') {
          closeModal()
        }

        isDragging.current = false
        dragDirection.current = null
      }

      return (
        <div className="photo-viewer-wrapper">
          <button className="close-btn" onClick={closeModal}>✕</button>

          <div
            className="photo-viewer-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img
              src={GALLERY_IMAGES[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              draggable={false}
              className="photo-viewer-image pinch-zoom"
            />
          </div>

          {/* 하단 바(footer)를 사진 컨테이너 바로 아래로 이동 */}
          <div className="photo-viewer-footer">
            <span className="photo-counter">{currentIndex + 1} / {GALLERY_IMAGES.length}</span>
            <div className="photo-viewer-indicators">
              {GALLERY_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  ref={(el) => { indicatorRefs.current[idx] = el }}
                  className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
            {/* 카운터와 인디케이터의 공간을 맞추기 위한 빈 요소 */}
            <span className="photo-counter-placeholder" />
          </div>

          <div className="photo-viewer-navigation">
            <button
              className="nav-btn prev-btn"
              onClick={goToPrevious}
              aria-label="이전 사진"
            >
              <span>‹</span>
            </button>
            <button
              className="nav-btn next-btn"
              onClick={goToNext}
              aria-label="다음 사진"
            >
              <span>›</span>
            </button>
          </div>
        </div>
      )
    }

    openModal({
      className: "photo-viewer-modal",
      closeOnClickBackground: false,
      content: <PhotoViewer />,
    })
  }, [openModal, closeModal])

  return (
    <div className="card gallery">
      <h2 className="english">사진첩</h2>

      {GALLERY_IMAGES.length === 0 ? (
        <div>이미지가 없습니다.</div>
      ) : (
        <GalleryGrid onPhotoClick={openPhotoModal} />
      )}
    </div>
  )
}
