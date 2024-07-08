import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { IoBookOutline, IoCubeOutline, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { PiBank, PiShoppingCart } from 'react-icons/pi';
import { LuPhoneCall } from 'react-icons/lu';
import { GoGear, GoPersonAdd } from 'react-icons/go';
import { BsShopWindow, BsWindow } from 'react-icons/bs';
import { TfiPieChart } from 'react-icons/tfi';
import { AiOutlineMail } from 'react-icons/ai';
import { RxDrawingPin } from 'react-icons/rx';
import { MdCancel, MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { IconType } from 'react-icons';
import { FiAlertTriangle } from 'react-icons/fi';


import './App.css';

const TABS = [
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

type SelectedTab = {
  title: string;
  Icon: IconType;
  isPinned: boolean;
  index: number;
  nextIndex?: number;
  width: number;
  canMove: boolean;
};

function Box({ content, position }: { content: SelectedTab | null, position: { x: number; y: number; tabIsBeingDragged: boolean; } }) {
  const style = useMemo(() => ({ transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`, width: `${content?.width}px` }), [position, content]);

  if (!content || !position?.tabIsBeingDragged) return;

  return (
    <div style={style} className="box flex items-center">
      <content.Icon className="icon" size={15} />
      <span>{content.title}</span>
    </div>
  )
}

function Main() {
  const navigate = useNavigate();

  const [pinnedTabs, setPinnedTabs] = useState<{ title: string; Icon: IconType }[]>(TABS.slice(0, 4));
  const [unpinnedTabs, setUnpinnedTabs] = useState<{ title: string; Icon: IconType }[]>(TABS.slice(4,));
  const [showMoreTabs, setShowMoreTabs] = useState(true);

  const [position, setPosition] = useState({ x: 0, y: 0, tabIsBeingDragged: false });

  const [delay, setDelay] = useState(0);
  const timeout = useRef<number>(0);

  const [tab, setTab] = useState<SelectedTab | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showError() {
    setError(`Cannot move ${tab?.isPinned ? 'pinned' : 'unpinned'} tab to ${tab?.isPinned ? 'unpinned' : 'pinned'} tabs`);
    setTimeout(clearError, 5000);
  };
  function clearError() {
    setError(null);
  }

  function addToPinnedTabs(index: number) {
    const newUnpinnedTabs = [...unpinnedTabs];
    const selectedTab = newUnpinnedTabs.splice(index, 1);
    if (selectedTab.length < 1) return;
    setPinnedTabs(prev => [...prev, ...selectedTab]);
    setUnpinnedTabs(newUnpinnedTabs);
  }

  function removeFromPinnedTabs(index: number) {
    const newPinnedTabs = [...pinnedTabs];
    const selectedTab = newPinnedTabs.splice(index, 1);
    if (selectedTab.length < 1 || pinnedTabs.length <= 1) return;
    setUnpinnedTabs(prev => [...prev, ...selectedTab]);
    setPinnedTabs(newPinnedTabs);
    navigate(`/${pinnedTabs[pinnedTabs.length - 1]}`);
  }

  const reorderTabs: React.SetStateAction<{ title: string; Icon: IconType }[]> = (prev) => {
    const tabs = [...prev];
    const currentTab = tabs.splice(Number(tab?.index), 1)
    if (currentTab.length < 1) return prev;
    tabs.splice(Number(tab?.nextIndex), 0, ...currentTab);
    return tabs;
  };

  function initiateDrag(element: Element) {
    const isPinned = element.classList.contains('pinned');
    const index = Number(element.id);
    const selectedTab = isPinned ? pinnedTabs[index] : unpinnedTabs[index];

    if (!selectedTab) return;
    clearError();
    setTab({
      ...selectedTab,
      isPinned,
      index,
      nextIndex: index,
      width: element.clientWidth,
      canMove: true
    });
  }
  
  const start: React.TouchEventHandler<HTMLElement> & React.MouseEventHandler<HTMLElement> = (event) => { 
    const element = (event.target as HTMLElement)?.closest('.tab-container');
    if (!element) return;
    timeout.current = setTimeout(() => initiateDrag(element), delay);
  };

  const handleMove: React.MouseEventHandler<HTMLElement> & React.TouchEventHandler<HTMLElement> = (event) => {
    const element = (event.target as HTMLElement)?.closest('.tab-container');
    if (!tab || !element) return;
    const elementIsPinned = element.classList.contains('pinned');
    if ((elementIsPinned && tab.isPinned) || (!elementIsPinned && !tab.isPinned)) {
      element.classList.add('next-tab');
      setTab(prev => prev && ({ ...prev, nextIndex: Number(element.id), canMove: true }));
    }
    else {
      element.classList.add('forbidden');
      setTab(prev => prev && ({ ...prev, canMove: false }));
    };
  }

  const handleOut: React.MouseEventHandler<HTMLElement> & React.TouchEventHandler<HTMLElement> = (event) => { 
    const element = (event.target as HTMLElement)?.closest('.tab-container');
    element?.classList?.remove('next-tab', 'forbidden');
  }

  const end: React.TouchEventHandler<HTMLElement> & React.MouseEventHandler<HTMLElement> = () => { 
    reset();
    clearTimeout(timeout.current);

    if (!tab || !position?.tabIsBeingDragged) return;
    else if (!tab?.canMove) showError();
    else if (tab?.isPinned) setPinnedTabs(reorderTabs);
    else setUnpinnedTabs(reorderTabs);
  };

  function reset() {
    document.querySelectorAll('.tab-container').forEach(elem => elem.classList.remove('next-tab', 'forbidden'));
    setPosition(prev => ({ ...prev, tabIsBeingDragged: false }));
    setTab(null);
  }

  useEffect(() => { 
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY, tabIsBeingDragged: Boolean(tab) });
    };
    const handleResize = () => {
      setDelay(window.innerWidth <= 1024 && window.innerHeight <= 1366 ? 2000 : 0);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize)
    }
  }, [tab])

  return (
    <div onMouseUp={reset} id="main" className="flex">
      <Box content={tab} position={position} />
      <div className="left-bar"></div>

      <div className="right flex flex-col flex-1">
        <div className="top-bar"></div>
        <div className="relative flex justify-between">
          <ul className="tabs flex flex-1">
            {
              pinnedTabs.map(({ title, Icon }, index) => (
                <li
                  key={index}
                  id={`${index}`}
                  className={`tab-container pinned relative ${index == tab?.index && position.tabIsBeingDragged && tab.isPinned ? 'dragging' : ''}`}
                  onMouseDown={start}
                  onMouseMove={handleMove}
                  onMouseOut={handleOut}
                  onMouseUp={end}
                  onTouchStart={start}
                  onTouchMove={handleMove}
                  onTouchEnd={end}
                >
                    <NavLink to={`/${title}`} draggable={false} className={({ isActive }) => `tab ${isActive && 'active'} relative flex items-center justify-center`}>
                      <Icon size={15} className="icon" />
                      <span>{title}</span>
                      <button onClick={() => removeFromPinnedTabs(index)} className="flex items-center justify-center close-btn">
                        <MdCancel size={15} />
                      </button>
                    </NavLink>
                </li>
              ))
            }
          </ul>
          {
            Boolean(unpinnedTabs.length) ?
              <div className="absolute more-tabs">
                <button onClick={() => setShowMoreTabs(!showMoreTabs)} className={`${showMoreTabs && 'active'} more-tabs-btn flex items-center justify-center`}>
                  <MdKeyboardArrowDown size={15} className="icon" />
                </button>
                {
                  showMoreTabs ?
                    <ul className="absolute unpinned-tabs flex flex-col flex flex-col">
                      {
                        unpinnedTabs.map(({ title, Icon }, index) => (
                          <li
                            key={index}
                            id={`${index}`}
                            className={`tab-container relative ${tab?.index == index && position?.tabIsBeingDragged && !tab?.isPinned ? 'dragging' : ''}`}
                            onMouseDown={start}
                            onMouseUp={end}
                            onMouseMove={handleMove}
                            onMouseOut={handleOut}
                            onTouchStart={start}
                            onTouchMove={handleMove}
                            onTouchEnd={end}
                            onClick={() => addToPinnedTabs(index)}
                          >
                            <NavLink to={`/${title}`} draggable={false} className={({ isActive }) => `tab ${isActive && 'active'} relative flex items-center justify-between`}>
                              <Icon size={15} className="icon" />
                              <span className="flex-1">{title}</span>
                              <button className="flex items-center justify-center close-btn">
                                <RxDrawingPin size={15} />
                              </button>
                            </NavLink>
                          </li>
                        ))
                      }
                    </ul> :
                    null
                }
              </div> :
              null
          }
        </div>
        <div className="workspace relative flex flex-1">
          {
            error ?
              <div className="absolute error-msg flex items-center justify-center">
                <FiAlertTriangle size={13} />
                <span>{error}</span>
                <button onClick={clearError} className="flex items-center justify-center">
                  <MdClose size={15} />
                </button>
              </div> :
              null
          }
          <div className="board flex-1"></div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="*" element={<Main />} />
    </Routes>
  )
}

export default App
