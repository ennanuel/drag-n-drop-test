import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { IconType } from 'react-icons';
import { FiAlertTriangle } from 'react-icons/fi';

import DragBox from './DragBox';
import Tab from './Tab';

import { TABS, SelectedTab } from './constantsAndTypes';

import './App.css';


function Main() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const savedTabOrder = useMemo<{ pinned: number[]; unpinned: number[]; }>(() => {
    try {
      const tabsOrder = JSON.parse(String(localStorage.getItem('tabsOrder')));
      if (!tabsOrder) throw new Error('Nothing saved');
      return tabsOrder;
    } catch (error) {
      return { pinned: [], unpinned: [] };
    }
  }, []);

  function getTabs(tabType: 'pinned' | 'unpinned'): { id: number; title: string; Icon: IconType; isPinned: boolean; }[] {
    const tabs = Boolean(savedTabOrder.pinned.length) && Boolean(savedTabOrder.unpinned.length) ?
      TABS
        .filter(item => savedTabOrder[tabType].includes(item.id))
        .map(item => ({ ...item, isPinned: tabType === 'pinned' })) :
      TABS.filter(item => (tabType === 'unpinned' ? !item.isPinned : item.isPinned));
    return tabs;
  }

  const [showMoreTabs, setShowMoreTabs] = useState(true);

  const [pinnedTabs, setPinnedTabs] = useState(() => getTabs('pinned'));
  const [unpinnedTabs, setUnpinnedTabs] = useState(() => getTabs('unpinned'));

  const [position, setPosition] = useState({ x: 0, y: 0, tabIsBeingDragged: false });

  const [delay, setDelay] = useState(0);
  const timeout = useRef<number>(0);

  const [tab, setTab] = useState<SelectedTab | null>(null);
  const [error, setError] = useState<string | null>(null);


  function navigateToTab(title: string) {
    navigate(`/${title}`);
  }

  function showError() {
    setError(`Cannot move ${tab?.isPinned ? 'pinned' : 'unpinned'} tab to ${tab?.isPinned ? 'unpinned' : 'pinned'} tabs`);
    setTimeout(clearError, 5000);
  }

  function clearError() {
    setError(null);
  }

  function addToPinnedTabs(index: number, title: string, dontNavigate?: boolean) {
    const newUnpinnedTabs = [...unpinnedTabs];
    const selectedTab = newUnpinnedTabs.splice(index, 1);
    if (selectedTab.length < 1) return;
    setPinnedTabs(prev => [...selectedTab, ...prev].map(tab => ({...tab, isPinned: true})));
    setUnpinnedTabs(newUnpinnedTabs);

    if (dontNavigate) return;
    navigateToTab(title);
  }


  function removeFromPinnedTabs(index: number, title: string) {
    const newPinnedTabs = [...pinnedTabs];
    const selectedTab = newPinnedTabs.splice(index, 1);
    setUnpinnedTabs(prev => [...prev, ...selectedTab].map(tab => ({ ...tab, isPinned: false })));
    setPinnedTabs(newPinnedTabs);

    if (pathname.replace(/(\W|\s|\d)/ig, '').includes(title.replace(/(\W|\s|\d)/ig, ''))) return;
    navigateToTab(newPinnedTabs[0]?.title || '');
  }


  const reorderTabs: React.SetStateAction<{ id: number; title: string; Icon: IconType; isPinned: boolean; }[]> = (prev) => {
    const tabs = [...prev];
    const currentTab = tabs.splice(Number(tab?.index), 1)
    if (currentTab.length < 1) return prev;
    tabs.splice(Number(tab?.nextIndex), 0, ...currentTab);
    return tabs;
  }


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
    event.preventDefault();
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
    const pinned = pinnedTabs.map(tab => tab.id);
    const unpinned = unpinnedTabs.map(tab => tab.id);

    const order = { pinned, unpinned };
    localStorage.setItem('tabsOrder', JSON.stringify(order));
  }, [pinnedTabs, unpinnedTabs])

  useEffect(() => { 
    const isMobile = window.innerWidth <= 1024 && window.innerHeight <= 1366;

    const handleResize = () => setDelay(isMobile ? 2000 : 0);

    const handleWindowMove = (event: MouseEvent | TouchEvent) => {
      let x = 0, y = 0;
      if (event.type === 'mousemove') {
        x = (event as MouseEvent).clientX;
        y = (event as MouseEvent).clientY;
      } else if (event.type === 'touchmove') {
        const touch = (event as TouchEvent).touches || (event as TouchEvent).changedTouches;
        if (Boolean(touch?.length)) {
          x = touch[0].pageX;
          y = touch[0].pageY;
        }
      }
      setPosition({ x, y, tabIsBeingDragged: Boolean(tab) });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener(isMobile ? 'touchmove' : 'mousemove', handleWindowMove);

    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('touchmove', handleWindowMove);
      window.removeEventListener('resize', handleResize);
    }
  }, [tab, delay])

  return (
    <div onMouseUp={reset} id="main" className="flex">
      <DragBox content={tab} position={position} />
      <div className="left-bar"></div>

      <div className="right flex flex-col flex-1">
        <div className="top-bar"></div>
        <div className="tabs-container relative flex justify-between">
          <ul className="tabs flex flex-1">
            {
              pinnedTabs.map((pinnedTab, index) => (
                <Tab
                  navigateToTab={navigateToTab}
                  key={index}
                  index={index}
                  tab={pinnedTab}
                  selectedTab={tab}
                  pathname={pathname}
                  start={start}
                  end={end}
                  handleMove={handleMove}
                  handleOut={handleOut}
                  addToPinnedTabs={addToPinnedTabs}
                  removeFromPinnedTabs={removeFromPinnedTabs}
                  tabIsBeingDragged={position.tabIsBeingDragged}
                />
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
                        unpinnedTabs.map((unpinnedTab, index) => (
                          <Tab
                            key={index}
                            index={index}
                            tab={unpinnedTab}
                            selectedTab={tab}
                            pathname={pathname}
                            navigateToTab={navigateToTab}
                            start={start}
                            end={end}
                            handleMove={handleMove}
                            handleOut={handleOut}
                            addToPinnedTabs={addToPinnedTabs}
                            removeFromPinnedTabs={removeFromPinnedTabs}
                            tabIsBeingDragged={position.tabIsBeingDragged}
                          />
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
