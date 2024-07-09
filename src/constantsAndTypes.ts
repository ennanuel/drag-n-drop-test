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
    title: "Dashboard",
    Icon: IoGridOutline,
    isPinned: true
  },
  {
    title: "Banking",
    Icon: PiBank,
    isPinned: true
  },
  {
    title: "Telefonie",
    Icon: LuPhoneCall,
    isPinned: true
  },
  {
    title: "Accounting",
    Icon: GoPersonAdd,
    isPinned: true
  },
  {
    title: "Verkauf",
    Icon: BsShopWindow,
    isPinned: false
  },
  {
    title: "Statistik",
    Icon: TfiPieChart,
    isPinned: false
  },
  {
    title: "Post Office",
    Icon: AiOutlineMail,
    isPinned: false
  },
  {
    title: "Administration",
    Icon: GoGear,
    isPinned: false
  },
  {
    title: "Help",
    Icon: IoBookOutline,
    isPinned: false
  },
  {
    title: "Warenbestand",
    Icon: IoCubeOutline,
    isPinned: false
  },
  {
    title: "Auswallisten",
    Icon: IoListOutline,
    isPinned: false
  },
  {
    title: "Einkauf",
    Icon: PiShoppingCart,
    isPinned: false
  },
  {
    title: "Rechn",
    Icon: BsWindow,
    isPinned: false
  }
]

export type SelectedTab = {
  title: string;
  Icon: IconType;
  isPinned: boolean;
  index: number;
  nextIndex?: number;
  width: number;
  canMove: boolean;
};