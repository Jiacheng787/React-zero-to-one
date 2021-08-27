import { Button } from 'antd';
import * as React from 'react';
import './App.scss';
import Logo from "./assets/logo.png";

type Props = {
  toWhat: string;
};
type State = {};

class App extends React.Component<Props, State> {
  handleClick(): void {
    console.log('2333');
  }
  render(): JSX.Element {
    return (
      <div className="app">
        <div className="text">Hello</div>
        <div>{this.props.toWhat}</div>
        <img src={Logo} alt="" />
        <div>
          <Button type="primary">测试按钮</Button>
        </div>
      </div>
    );
  }
}

export default App;
