import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.info);

/**
 * <React.StrictMode>
 *
 * https://ko.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
 *
 * 애플리케이션 내의 잠재적인 문제를 알아내기 위한 도구이다. 이 모드는 개발모드에서만 활성화 되기 때문에, 프로덕션 빌드에는 영향을 끼치지 않는다.
 *
 * "예상치 못한 부작용 검사"를 보면 `렌더링` 단계에서 아래의 함수들을 의도적으로 이중호출한다.
 *   - 클래스 컴포넌트의 constructor, render 그리고 shouldComponentUpdate 메서드
 *   - 클래스 컴포넌트의 getDerivedStateFromProps static 메서드
 *   - 함수 컴포넌트 바디
 *   - State updater 함수 (setState의 첫 번째 인자)
 *   - useState, useMemo 그리고 useReducer에 전달되는 함수
 *
 * React 17 부터는 생명주기 함수의 이중호출에서 console.log() 같은 콘솔 메서드를 수정하여 로그를 찍지 않는다.
 * 다만, `const log = console.log; log('LOG MESSAGE');`처럼 사용하면 여전히 매번 로그가 찍힌다.
 *
 */
