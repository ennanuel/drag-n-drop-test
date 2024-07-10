import { IoBookOutline, IoCubeOutline, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { PiBank, PiShoppingCart } from 'react-icons/pi';
import { LuPhoneCall } from 'react-icons/lu';
import { GoGear, GoPersonAdd } from 'react-icons/go';
import { BsShopWindow, BsWindow } from 'react-icons/bs';
import { TfiPieChart } from 'react-icons/tfi';
import { AiOutlineMail } from 'react-icons/ai';
import { IconType } from 'react-icons';

export const TABS = [
  {
    id: 1,
    title: "Dashboard",
    Icon: IoGridOutline,
    isPinned: true
  },
  {
    id: 2,
    title: "Banking",
    Icon: PiBank,
    isPinned: true
  },
  {
    id: 3,
    title: "Telefonie",
    Icon: LuPhoneCall,
    isPinned: true
  },
  {
    id: 4,
    title: "Accounting",
    Icon: GoPersonAdd,
    isPinned: true
  },
  {
    id: 5,
    title: "Verkauf",
    Icon: BsShopWindow,
    isPinned: false
  },
  {
    id: 6,
    title: "Statistik",
    Icon: TfiPieChart,
    isPinned: false
  },
  {
    id: 7,
    title: "Post Office",
    Icon: AiOutlineMail,
    isPinned: false
  },
  {
    id: 8,
    title: "Administration",
    Icon: GoGear,
    isPinned: false
  },
  {
    id: 9,
    title: "Help",
    Icon: IoBookOutline,
    isPinned: false
  },
  {
    id: 10,
    title: "Warenbestand",
    Icon: IoCubeOutline,
    isPinned: false
  },
  {
    id: 11,
    title: "Auswallisten",
    Icon: IoListOutline,
    isPinned: false
  },
  {
    id: 12,
    title: "Einkauf",
    Icon: PiShoppingCart,
    isPinned: false
  },
  {
    id: 13,
    title: "Rechn",
    Icon: BsWindow,
    isPinned: false
  }
]

export type SelectedTab = {
  id: number;
  title: string;
  Icon: IconType;
  isPinned: boolean;
  index: number;
  nextIndex?: number;
  width: number;
  canMove: boolean;
};