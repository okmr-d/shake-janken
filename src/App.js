import React from 'react'

const handNameList = ["guu", "choki", "paa"]
const last = {
  time: new Date(),
  x: null,
  y: null,
  z: null,
}

class App extends React.Component {

  state = {
    isStarted: false,
    isGranted: false,
    handName: null,
    threshold: 4,
    shaked: false,
  }

  constructor(props) {
    super(props)
    this.deviceMotionHandler = this.deviceMotionHandler.bind(this)
    this.requestDeviceMotionPermission = this.requestDeviceMotionPermission.bind(this)
    this.setShuffleHand = this.setShuffleHand.bind(this)
  }

  deviceMotionHandler(event) {
    const current = event.accelerationIncludingGravity
    const { threshold } = this.state

    if ((last.x === null) && (last.y === null) && (last.z === null)) {
      last.x = current.x
      last.y = current.y
      last.z = current.z
      return
    }

    const deltaX = Math.abs(last.x - current.x)
    const deltaY = Math.abs(last.y - current.y)
    const deltaZ = Math.abs(last.z - current.z)

    // shake判定
    if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
      this.setShuffleHand()
    }

    last.x = current.x
    last.y = current.y
    last.z = current.z
  }

  setShuffleHand() {
    // 前回から 300ms 時間が経ったか
    if ((new Date()).getTime() - last.time.getTime() > 300) {
      const handName = handNameList[Math.floor(Math.random() * 3)]
      this.setState({
        handName,
        shaked: true
      })

      setTimeout(() => {
        this.setState({ shaked: false })
      }, 100);

      last.time = new Date()
    }
  }

  requestDeviceMotionPermission() {
    if (
      DeviceMotionEvent &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      // iOS 13+ の Safari
      // 許可を取得
      DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          // 許可を得られた場合、devicemotionをイベントリスナーに追加
          window.addEventListener('devicemotion', this.deviceMotionHandler, false)
          this.setState({
            isStarted: true,
            isGranted: true,
          })
        } else {
          // 許可を得られなかった場合の処理
          this.setState({
            isStarted: true,
            isGranted: false,
          })
        }
      })
      .catch(error => {
        // https通信でない場合などで許可を取得できなかった場合
        alert(error)
      })
    } else if (DeviceOrientationEvent) {
      // 上記以外のブラウザ
      window.addEventListener('devicemotion', this.deviceMotionHandler, false)
      this.setState({
        isStarted: true,
        isGranted: true,
      })
    } else {
      // このブラウザではご利用になれません。
    }
  }

  render() {
    const {
      isStarted,
      isGranted,
      handName,
      threshold,
      shaked,
    } = this.state

    if (!isStarted) {
      return (
        <div className="app">
          <div className="title-container">
            <h1 className="title">〜 振ってジャンケン 〜</h1>
            <div className="help">スマホやタブレットでみてね</div>
          </div>
          <div className="hands-container">
            <ul className="start-hands">
              <li><img src={`images/guu.png`}  /></li>
              <li><img src={`images/choki.png`} /></li>
              <li><img src={`images/paa.png`} /></li>
            </ul>
          </div>
          <div class="button-container">
            <a
              className="button"
              onClick={() => this.requestDeviceMotionPermission()}
            >
              スタート！
            </a>
          </div>
        </div>
      )
    } else if (!isGranted) {
      return (
        <div className="app">
          許可を取得できませんでした・・・😢
        </div>
      )
    } else if (handName === null) {
      return (
        <div className="app started" onClick={this.setShuffleHand}>
          <div className="title-container">
            <div className="title">振ると変わるよ！</div>
            <div className="help">タッチでもOK!</div>
          </div>
          <div className="hand-image-container">
            <div className="hand-image-wrapper">
              <div className="hand-image">
                <img src={`images/guu.png`} />
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={`app started ${shaked ? 'shaked' : ''}`} onClick={this.setShuffleHand}>
          <div className="hand-image-container">
            <div className="hand-image-wrapper">
              <div className="hand-image">
                <img src={`images/${handName}.png`} />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default App
