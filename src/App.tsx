import Logo from "@assets/logo.png";
import { Button } from 'antd';
import * as React from 'react';
import './App.scss';

type Props = {
  toWhat: string;
};
type State = {};

class App extends React.Component<Props, State> {
  handleClick(): void {
    let a;
    let b;
    console.log(process.env.NODE_ENV);
    console.log(process.env.REACT_APP_BASE);
  }
  render(): JSX.Element {
    return (
      <div className="app">
        <div className="text">Hello</div>
        <div>{this.props.toWhat}</div>
        <img src={Logo} alt="" />
        <div>
          <Button type="primary" onClick={this.handleClick}>测试按钮</Button>
        </div>
      </div>
    );
  }
}

export default App;
