import { useCallback, useEffect, useState, useRef, memo } from "react"
import { LazyDiv } from "../lazyDiv"
import { useModal } from "../modal"
import { GALLERY_IMAGES } from "../../images"

// React.memo를 사용하여 Gallery 컴포넌트를 감싸줍니다.
export const Gallery = memo(() => {
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    // preload images
    console.log('Gallery loading, images count:', GALLERY_IMAGES.length); // 디버그
    GALLERY_IMAGES.forEach((image) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  // 개별 사진 확대 보기를 위한 함수
  const openPhotoModal = useCallback((photoIndex: number) => {
    console.log('openPhotoModal called with index:', photoIndex); // 디버그
    const PhotoViewer = () => {
      const [currentIndex, setCurrentIndex] = useState(photoIndex)
      
      // 일반 변수 대신 useRef를 사용하여 상태를 관리합니다.
      // 이렇게 하면 리렌더링 시에도 값이 유지되며, 모달이 다시 열릴 때마다 독립적인 상태를 가집니다.
      const startX = useRef(0)
      const startY = useRef(0)
      const isDragging = useRef(false)
      const dragDirection = useRef<'horizontal' | 'vertical' | null>(null)

      const goToPrevious = () => {
        const newIndex = (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        setCurrentIndex(newIndex)
      }

      const goToNext = () => {
        const newIndex = (currentIndex + 1) % GALLERY_IMAGES.length
        setCurrentIndex(newIndex)
      }

      const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) { // 단일 터치만 처리 (핀치 줌과 구분)
          startX.current = e.touches[0].clientX
          startY.current = e.touches[0].clientY
          isDragging.current = false
          dragDirection.current = null
        }
      }

      const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && !isDragging.current) {
          const deltaX = e.touches[0].clientX - startX.current
          const deltaY = e.touches[0].clientY - startY.current
          
          // 드래그 방향 감지
          if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              dragDirection.current = 'horizontal'
              isDragging.current = true
            } else {
              dragDirection.current = 'vertical'
            }
          }
        }
      }

      const handleTouchEnd = (e: React.TouchEvent) => {
        if (dragDirection.current === 'horizontal' && isDragging.current) {
          e.preventDefault()
          const deltaX = e.changedTouches[0].clientX - startX.current
          
          if (Math.abs(deltaX) > 50) { // 최소 드래그 거리
            if (deltaX > 0) {
              goToPrevious()
            } else {
              goToNext()
            }
          }
        } else if (!isDragging.current && !dragDirection.current) {
          // 드래그가 아닌 단순 터치일 때 모달 닫기
          closeModal()
        }
        
        isDragging.current = false
        dragDirection.current = null
      }

      // 마우스 이벤트 (데스크톱용)
      const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX
        startY.current = e.clientY
        isDragging.current = false
        dragDirection.current = null
      }

      const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons === 1 && !isDragging.current) { // 왼쪽 버튼이 눌린 상태
          const deltaX = e.clientX - startX.current
          const deltaY = e.clientY - startY.current
          
          if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              dragDirection.current = 'horizontal'
              isDragging.current = true
            } else {
              dragDirection.current = 'vertical'
            }
          }
        }
      }

      const handleMouseUp = (e: React.MouseEvent) => {
        if (dragDirection.current === 'horizontal' && isDragging.current) {
          e.preventDefault()
          const deltaX = e.clientX - startX.current
          
          if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              goToPrevious()
            } else {
              goToNext()
            }
          }
        } else if (!isDragging.current && dragDirection.current !== 'horizontal') {
          // 드래그가 아닌 단순 클릭일 때 모달 닫기
          closeModal()
        }
        
        isDragging.current = false
        dragDirection.current = null
      }

      return (
        <div className="photo-viewer-wrapper">
          <div className="photo-viewer-header">
            <span className="photo-counter">{currentIndex + 1} / {GALLERY_IMAGES.length}</span>
            <button className="close-btn" onClick={closeModal}>✕</button>
          </div>
          
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

          <div className="photo-viewer-navigation">
            <button 
              className="nav-btn prev-btn" 
              onClick={goToPrevious}
              aria-label="이전 사진"
            >
              ‹
            </button>
            <button 
              className="nav-btn next-btn" 
              onClick={goToNext}
              aria-label="다음 사진"
            >
              ›
            </button>
          </div>

          <div className="photo-viewer-indicators">
            {GALLERY_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
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
        <div className="photo-grid">
          {GALLERY_IMAGES.map((image, idx) => {
            console.log('Rendering image:', idx, image); // 디버그
            return (
              <div 
                key={idx} 
                className="photo-grid-item" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Photo clicked:', idx); // 디버그용
                  openPhotoModal(idx);
                }}
              >
                <img
                  src={image}
                  alt={`Photo ${idx + 1}`}
                  draggable={false}
                  onLoad={() => console.log('Image loaded:', idx)}
                  onError={() => console.log('Image error:', idx)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
})
