import { useEffect, useState } from "react"


const Header = ()=>{

    const[userCheck, setUserCheck] = useState(localStorage.getItem('userId'))
    const [state, setState] = useState(true)
    useEffect(()=>{
        setUserCheck(localStorage.getItem('userId'))
    }, [state])

    return(
        <header>
        <div className="navbar">
          <div className="logo">
            <i className="fas fa-map-marked-alt"></i>
            <span>GeoDiscover</span>
          </div>
          <nav className="nav-links">
            <a href="/">Главная</a>
            <a href="/map">Карта</a>
            <a href="/routes">Маршруты</a>
            <a href="/library">Библиотека</a>
            <a href="/forum">Форум</a>
          </nav>
          { userCheck == null ? 
          <a href="/auth" className="auth-btn">Войти</a>:
          <div>
                <a href="#" onClick={()=>{
                    localStorage.removeItem('userId')
                    localStorage.removeItem('user')
                    setState(false)
                }} className="auth-btn">Выйти</a>
                <a href="/profile" className="auth-btn">Профиль</a>
          </div>
          
          }

        </div>
      </header>
    )
}
export default Header