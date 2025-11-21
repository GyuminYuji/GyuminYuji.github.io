import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export { dayjs }

export const WEDDING_DATE = dayjs.tz("2026-02-07 13:50", "Asia/Seoul")
export const HOLIDAYS = [15]

export const LOCATION = "부산 아시아드시티 웨딩홀 - 마그리트홀"
export const LOCATION_ADDRESS = "부산 연제구 거제동 1299 : 아시아드스타디움 1F"

export const SHARE_ADDRESS = "부산 아시아드시티 웨딩홀"
export const SHARE_ADDRESS_TITLE = "부산 아시아드시티 웨딩홀"

export const WEDDING_HALL_POSITION = [129.058204, 35.190186]

export const NMAP_PLACE_ID = 19936207
export const KMAP_PLACE_ID = 14723705

export const BRIDE_FULLNAME = "조유지"
export const BRIDE_FIRSTNAME = "유지"
export const BRIDE_TITLE = "차녀"
export const BRIDE_FATHER = ""
export const BRIDE_MOTHER = "김정애"
export const BRIDE_INFO = [
  {
    relation: "신부",
    name: BRIDE_FULLNAME,
    phone: "010-5175-3140",
    account: "카카오뱅크 3333-07-7700365 (조유지)",
  },
  {
    relation: "신부 어머니",
    name: BRIDE_MOTHER,
    phone: "010-8538-4871",
    account: "새마을금고 9002-1876-6443-2 (조현수)",
  },
]

export const GROOM_FULLNAME = "이규민"
export const GROOM_FIRSTNAME = "규민"
export const GROOM_TITLE = "차남"
export const GROOM_FATHER = "이태우"
export const GROOM_MOTHER = "천해경"
export const GROOM_INFO = [
  {
    relation: "신랑",
    name: GROOM_FULLNAME,
    phone: "010-2988-8663",
    account: "카카오뱅크 3333-03-9966655 (이규민)",
  },
  {
    relation: "신랑 아버지",
    name: GROOM_FATHER,
    phone: "010-9589-8662",
    account: "신한은행 110-008-393895 (이태우)",
  },
  {
    relation: "신랑 어머니",
    name: GROOM_MOTHER,
    phone: "010-6644-8661",
    account: "부산은행 100-02-013401-0 (천해경)",
  },
]
