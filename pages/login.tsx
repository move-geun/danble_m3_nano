import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

const PASSWORD = process.env.NEXT_PUBLIC_PASSWORD || 'danble1234!' // .env에서 읽어오기, 없으면 기본값
const COOKIE_NAME = 'm3_nano_auth'
const COOKIE_EXPIRY_DAYS = 7

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 쿠키 확인
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${COOKIE_NAME}=`)
      )
      
      if (authCookie) {
        // 쿠키가 있으면 자동으로 메인 페이지로 이동
        router.push('/')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password === PASSWORD) {
      // 쿠키 설정 (7일 유효)
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS)
      document.cookie = `${COOKIE_NAME}=authenticated; expires=${expiryDate.toUTCString()}; path=/`
      
      // 메인 페이지로 이동
      router.push('/')
    } else {
      setError('패스워드가 올바르지 않습니다')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>🔐 인증 필요</h1>
        <p className={styles.subtitle}>관계자만 접근 가능합니다</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>패스워드</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="패스워드를 입력하세요"
              autoFocus
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !password}
            className={styles.button}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

