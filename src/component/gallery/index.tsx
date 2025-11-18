import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "../../icons/angle-left-sm.svg?react"
import { LazyDiv } from "../lazyDiv"
import { Button } from "../button"
import { useModal } from "../modal"
import { GALLERY_IMAGES } from "../../images"

const CAROUSEL_ITEMS = GALLERY_IMAGES.map((item, idx) => (
  <div className="carousel-item" key={idx}>
    <img src={item} draggable={false} alt={`${idx}`} />
  </div>
))

const DRAG_SENSITIVITY = 15

type Status =
  | "stationary"
  | "clicked"
  | "clickCanceled"
  | "dragging"
  | "dragEnding"
  | "moving-left"
  | "moving-right"

type DragOption = {
  startingClientX: number
  startingClientY: number
  currentTranslateX: number
}

type ClickMove = "left" | "right" | null

export const Gallery = () => {
  const { openModal, closeModal } = useModal()
  const carouselRef = useRef<HTMLDivElement>({} as HTMLDivElement)

  useEffect(() => {
    // preload images
    GALLERY_IMAGES.forEach((image) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  const [slide, _setSlide] = useState(0)
  const slideRef = useRef(0)
  const setSlide = (slide: number) => {
    _setSlide(slide)
    slideRef.current = slide
  }

  const [status, _setStatus] = useState<Status>("stationary")
  const statusRef = useRef<Status>("stationary")
  const setStatus = (status: Status) => {
    _setStatus(status)
    statusRef.current = status
  }

  const [dragOption, _setDragOption] = useState<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const dragOptionRef = useRef<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const setDragOption = (dragOption: DragOption) => {
    _setDragOption(dragOption)
    dragOptionRef.current = dragOption
  }

  const [moveOption, setMoveOption] = useState({
    srcIdx: 0,
    dstIdx: 0,
  })

  const clickMoveRef = useRef<ClickMove>(null)
  const setClickMove = (clickMove: ClickMove) => {
    clickMoveRef.current = clickMove
  }

  // For debugging
  // useEffect(() => {
  //   console.log(status)
  // }, [status])

  const click = (
    status: Status,
    clientX: number,
    clientY: number,
    carouselWidth: number,
  ) => {
    if (status !== "stationary") return
    setDragOption({
      startingClientX: clientX,
      startingClientY: clientY,
      currentTranslateX: -carouselWidth,
    })
    setStatus("clicked")
  }

  const dragging = useCallback(
    (dragOption: DragOption, clientX: number, carouselWidth: number) => {
      let moveTranslateX = clientX - dragOption.startingClientX

      if (moveTranslateX > carouselWidth) {
        moveTranslateX = carouselWidth
      } else if (moveTranslateX < -carouselWidth) {
        moveTranslateX = -carouselWidth
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: moveTranslateX - carouselWidth,
      })
    },
    [],
  )

  const dragEnd = useCallback(
    (slide: number, dragOption: DragOption, carouselWidth: number) => {
      let move = 0
      if (dragOption.currentTranslateX < -carouselWidth * 1.1) {
        move = 1
      } else if (dragOption.currentTranslateX > -carouselWidth * 0.9) {
        move = -1
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: -carouselWidth * (move + 1),
      })

      setStatus("dragEnding")

      setTimeout(() => {
        setDragOption({
          ...dragOption,
          currentTranslateX: -carouselWidth,
        })
        setStatus("stationary")
        setSlide((slide + move + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length)
      }, 300)
    },
    [],
  )

  const move = useCallback((srcIdx: number, dstIdx: number) => {
    setSlide(dstIdx)
    if (srcIdx < dstIdx) {
      setStatus("moving-right")
    } else {
      setStatus("moving-left")
    }

    setMoveOption({ srcIdx, dstIdx })

    setTimeout(() => {
      setClickMove(null)
      setStatus("stationary")
    }, 300)
  }, [])

  /* Events */
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        setStatus("dragging")
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        e.preventDefault()
        const xMove =
          e.targetTouches[0].clientX - dragOptionRef.current.startingClientX
        const yMove =
          e.targetTouches[0].clientY - dragOptionRef.current.startingClientY
        if (Math.abs(xMove) > DRAG_SENSITIVITY) {
          setStatus("dragging")
        } else if (Math.abs(yMove) > DRAG_SENSITIVITY) {
          setStatus("clickCanceled")
        }
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.targetTouches[0].clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onMouseTouchUp = useCallback(() => {
    const status = statusRef.current
    const clickMove = clickMoveRef.current
    const slide = slideRef.current

    if (status === "clicked") {
      if (clickMove === "left") {
        move(slide, (slide + CAROUSEL_ITEMS.length - 1) % CAROUSEL_ITEMS.length)
      } else if (clickMove === "right") {
        move(slide, (slide + 1) % CAROUSEL_ITEMS.length)
      } else {
        setStatus("stationary")
      }
    } else if (status === "dragging") {
      dragEnd(slide, dragOptionRef.current, carouselRef.current.clientWidth)
    } else if (status === "clickCanceled") {
      setStatus("stationary")
    }
  }, [dragEnd, move])

  useEffect(() => {
    const carouselElement = carouselRef.current

    window.addEventListener("mousemove", onMouseMove)
    carouselElement.addEventListener("touchmove", onTouchMove)
    window.addEventListener("mouseup", onMouseTouchUp)
    window.addEventListener("touchend", onMouseTouchUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      carouselElement.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("mouseup", onMouseTouchUp)
      window.removeEventListener("touchend", onMouseTouchUp)
    }
  }, [onMouseMove, onTouchMove, onMouseTouchUp])

  const onIndicatorClick = useCallback(
    (status: Status, srcIdx: number, dstIdx: number) => {
      if (status !== "stationary" || srcIdx === dstIdx) return
      move(srcIdx, dstIdx)
    },
    [move],
  )

  const transformStyle = useMemo(() => {
    switch (status) {
      case "dragging":
      case "dragEnding":
        return { transform: `translateX(${dragOption.currentTranslateX}px)` }
      default:
        return {}
    }
  }, [status, dragOption])

  const transformClass = useMemo(() => {
    const className = "carousel-list"
    switch (status) {
      case "dragEnding":
        return className + " transitioning"
      case "moving-left":
        return className + " moving-left"
      case "moving-right":
        return className + " moving-right"
      default:
        return className
    }
  }, [status])

  // 개별 사진 확대 보기를 위한 함수 추가
  const openPhotoModal = useCallback((photoIndex: number) => {
    const PhotoViewer = () => {
      const [currentIndex, setCurrentIndex] = useState(photoIndex)
      let startX = 0
      let startY = 0
      let isDragging = false
      let dragDirection: 'horizontal' | 'vertical' | null = null

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
          startX = e.touches[0].clientX
          startY = e.touches[0].clientY
          isDragging = false
          dragDirection = null
        }
      }

      const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && !isDragging) {
          const deltaX = e.touches[0].clientX - startX
          const deltaY = e.touches[0].clientY - startY
          
          // 드래그 방향 감지
          if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              dragDirection = 'horizontal'
              isDragging = true
            } else {
              dragDirection = 'vertical'
            }
          }
        }
      }

      const handleTouchEnd = (e: React.TouchEvent) => {
        if (dragDirection === 'horizontal' && isDragging) {
          e.preventDefault()
          const deltaX = e.changedTouches[0].clientX - startX
          
          if (Math.abs(deltaX) > 50) { // 최소 드래그 거리
            if (deltaX > 0) {
              goToPrevious()
            } else {
              goToNext()
            }
          }
        }
        
        isDragging = false
        dragDirection = null
      }

      // 마우스 이벤트 (데스크톱용)
      const handleMouseDown = (e: React.MouseEvent) => {
        startX = e.clientX
        startY = e.clientY
        isDragging = false
        dragDirection = null
      }

      const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons === 1 && !isDragging) { // 왼쪽 버튼이 눌린 상태
          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY
          
          if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              dragDirection = 'horizontal'
              isDragging = true
            } else {
              dragDirection = 'vertical'
            }
          }
        }
      }

      const handleMouseUp = (e: React.MouseEvent) => {
        if (dragDirection === 'horizontal' && isDragging) {
          e.preventDefault()
          const deltaX = e.clientX - startX
          
          if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              goToPrevious()
            } else {
              goToNext()
            }
          }
        }
        
        isDragging = false
        dragDirection = null
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

  // 캐러셀에서 사진 클릭 핸들러 추가
  const handleCarouselImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (statusRef.current === "stationary") {
      openPhotoModal(slideRef.current)
    }
  }, [openPhotoModal])

  return (
    <LazyDiv className="card gallery">
      <h2 className="english">사진첩</h2>
      <div className="carousel-wrapper">
        <div
          className="carousel"
          ref={carouselRef}
          onMouseDown={(e) =>
            click(
              statusRef.current,
              e.clientX,
              e.clientY,
              e.currentTarget.clientWidth,
            )
          }
          onTouchStart={(e) =>
            click(
              statusRef.current,
              e.targetTouches[0].clientX,
              e.targetTouches[0].clientY,
              e.currentTarget.clientWidth,
            )
          }
        >
          <div className={transformClass} style={transformStyle}>
            {["dragging", "dragEnding"].includes(status) && [
              ...(slide === 0
                ? [
                    <div className="carousel-item" key={`prev-${CAROUSEL_ITEMS.length - 1}`}>
                      <img 
                        src={GALLERY_IMAGES[GALLERY_IMAGES.length - 1]} 
                        draggable={false} 
                        alt={`${GALLERY_IMAGES.length - 1}`}
                        onClick={handleCarouselImageClick}
                      />
                    </div>
                  ]
                : []),
              ...GALLERY_IMAGES.slice(slide === 0 ? 0 : slide - 1, slide + 2).map((image, idx) => {
                const actualIndex = slide === 0 ? idx : slide - 1 + idx
                return (
                  <div className="carousel-item" key={actualIndex}>
                    <img 
                      src={image} 
                      draggable={false} 
                      alt={`${actualIndex}`}
                      onClick={handleCarouselImageClick}
                    />
                  </div>
                )
              }),
              ...(slide === GALLERY_IMAGES.length - 1
                ? [
                    <div className="carousel-item" key={`next-0`}>
                      <img 
                        src={GALLERY_IMAGES[0]} 
                        draggable={false} 
                        alt="0"
                        onClick={handleCarouselImageClick}
                      />
                    </div>
                  ]
                : []),
            ]}
            {status === "moving-right" &&
              GALLERY_IMAGES.slice(moveOption.srcIdx, moveOption.dstIdx + 1).map((image, idx) => {
                const actualIndex = moveOption.srcIdx + idx
                return (
                  <div className="carousel-item" key={actualIndex}>
                    <img 
                      src={image} 
                      draggable={false} 
                      alt={`${actualIndex}`}
                      onClick={handleCarouselImageClick}
                    />
                  </div>
                )
              })}
            {status === "moving-left" &&
              GALLERY_IMAGES.slice(moveOption.dstIdx, moveOption.srcIdx + 1).map((image, idx) => {
                const actualIndex = moveOption.dstIdx + idx
                return (
                  <div className="carousel-item" key={actualIndex}>
                    <img 
                      src={image} 
                      draggable={false} 
                      alt={`${actualIndex}`}
                      onClick={handleCarouselImageClick}
                    />
                  </div>
                )
              })}
            {["stationary", "clicked", "clickCanceled"].includes(status) && (
              <div className="carousel-item">
                <img 
                  src={GALLERY_IMAGES[slide]} 
                  draggable={false} 
                  alt={`${slide}`}
                  onClick={handleCarouselImageClick}
                />
              </div>
            )}
          </div>
          <div className="carousel-control">
            <div
              className="control left"
              onMouseDown={() => {
                if (statusRef.current === "stationary") setClickMove("left")
              }}
              onTouchStart={() => {
                if (statusRef.current === "stationary") setClickMove("left")
              }}
            >
              <ArrowLeft className="arrow" />
            </div>
            <div
              className="control right"
              onMouseDown={() => {
                if (statusRef.current === "stationary") setClickMove("right")
              }}
              onTouchStart={() => {
                if (statusRef.current === "stationary") setClickMove("right")
              }}
            >
              <ArrowLeft className="arrow right" />
            </div>
          </div>
        </div>
        <div className="carousel-indicator">
          {CAROUSEL_ITEMS.map((_, idx) => (
            <button
              key={idx}
              className={`indicator${idx === slide ? " active" : ""}`}
              onClick={() =>
                onIndicatorClick(statusRef.current, slideRef.current, idx)
              }
            />
          ))}
        </div>
      </div>

      <div className="break" />

      <Button
        onClick={() =>
          openModal({
            className: "all-photo-modal",
            closeOnClickBackground: true,
            header: <div className="title">사진 전체보기</div>,
            content: (
              <>
                <div className="photo-list">
                  {GALLERY_IMAGES.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`${idx}`}
                      draggable={false}
                      onClick={() => {
                        if (statusRef.current === "stationary") {
                          closeModal() // 먼저 전체보기 모달 닫기
                          setTimeout(() => {
                            openPhotoModal(idx) // 개별 사진 확대 모달 열기
                          }, 100)
                        }
                      }}
                    />
                  ))}
                </div>
                <div className="break" />
              </>
            ),
            footer: (
              <Button
                buttonStyle="style2"
                className="bg-light-grey-color text-dark-color"
                onClick={closeModal}
              >
                닫기
              </Button>
            ),
          })
        }
      >
        사진 전체보기
      </Button>
    </LazyDiv>
  )
}
