
import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import SubwayIcon from "../../icons/subway-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import { LOCATION, LOCATION_ADDRESS } from "../../const"

export const Location = () => {
  return (
    <>
      <LazyDiv className="card location">
        <h2 className="english">오시는 길</h2>
        <div className="addr">
          {LOCATION}
          <div className="detail">{LOCATION_ADDRESS}</div>
        </div>
        <Map />
      </LazyDiv>
      <LazyDiv className="card location">
        {/* 지하철 정보 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <SubwayIcon className="transportation-icon" />
          </div>

          <div className="heading">지하철</div>
          <div />
          <div className="content">
            지하철 3호선 종합운동장역 9번출구 나와서
            <br />
            → 첫번째 골목에서 우회전
            <br />→ 홈플러스 방면으로 직진
            <br />→ 끝까지 올라오시면 아시아드시티웨딩홀 도착 (도보 약 15분 소요)
            <br />
            <br />
            <b>셔틀버스 운행</b>
            <br />
            종합운동장역 9번 출구에서 5분 간격으로 운행
            <br />
            (종합운동장역 ↔ 아시아드웨딩홀)
          </div>
          <div />
        </div>

        {/* 버스 정보 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <BusIcon className="transportation-icon" />
          </div>

          <div className="heading">버스</div>
          <div />
          <div className="content">
            <b>사직 실내 수영장</b> 하차 (부산진 → 사직) <br /> 54번, 57번, 83-1번, 131번
            <br />
            <b>삼정 그린 아파트</b> 하차 (사직 → 부산진) <br /> 54번, 57번, 83-1번
            <br />
            <b>아시아드 주경기장</b> 하차 (초읍 → 동래) <br /> 210번, 10번, 마을버스 부산진17번
            <br />
            <b>홈플러스</b> 하차 (초읍 → 동래) <br /> 마을버스 부산진17번
          </div>
          <div />
        </div>

        {/* 자동차 정보 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자동차</div>
          <div />
          <div className="content">
            내비게이션 이용
            <br />
            <b>아시아드시티 웨딩홀</b> 검색
            <br />
            웨딩홀 제1주차장, 제2주차장 이용
            <br />
            - 주차 요금은 무료입니다.
          </div>
          <div />
        </div>
      </LazyDiv>
    </>
  )
}
