import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import HtmlSplitMerge from './components/converters/HtmlSplitMerge';
import HtmlToChromeExtension from './components/converters/HtmlToChromeExtension';
import HtmlToWechatMiniprogram from './components/converters/HtmlToWechatMiniprogram';
import HtmlToUtoolsPlugin from './components/converters/HtmlToUtoolsPlugin';
import HtmlToMarkdown from './components/converters/HtmlToMarkdown';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const App = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container">
      <Header />
      
      <div className="card">
        <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
          <TabList>
            <Tab>HTML 拆分/合并</Tab>
            <Tab>HTML ⟷ Chrome插件</Tab>
            <Tab>HTML ⟷ 微信小程序</Tab>
            <Tab>HTML ⟷ uTools插件</Tab>
            <Tab>HTML ⟷ Markdown</Tab>
          </TabList>

          <TabPanel>
            <HtmlSplitMerge />
          </TabPanel>
          
          <TabPanel>
            <HtmlToChromeExtension />
          </TabPanel>
          
          <TabPanel>
            <HtmlToWechatMiniprogram />
          </TabPanel>
          
          <TabPanel>
            <HtmlToUtoolsPlugin />
          </TabPanel>
          
          <TabPanel>
            <HtmlToMarkdown />
          </TabPanel>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default App;
