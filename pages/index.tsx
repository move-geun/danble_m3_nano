import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "../styles/Home.module.css";

const COOKIE_NAME = "m3_nano_auth";

interface Product {
  type: string;
  sub_type?: string;
  image_url: string;
  [key: string]: any;
}

interface JsonData {
  style_id?: string;
  products: Product[] | { [key: string]: Product };
}

// 기본 Rulebook 텍스트
const DEFAULT_RULEBOOK = `Placement Criteria
- [**No shadow, flat single solid background**]
- [** Never place things on the edge.**]
- [**offWhite solid using background color, (240, 240, 236) #F0F0EC**]
- The entire product should be placed within the canvas.
(Only if the product is provided, the following items apply.)
- Coat: Spread flat in the center of the jacket (natural sleeves and hem)
- Underwear: Halfway down the right side and place it on the jacket
- Shoes: Two pairs in one direction on the bottom left corner (only air shot)
- Socks: Only if the product is provided, Two pairs on the right side of the shoe (air shot)
- Scarf (if provided):
 • Wrap naturally around the neck with “Loop-m-through" style
- Put your jacket in your jacket and flip it over
- Place entire items in a way that does not cut neatly within margin criteria
- Use only the items in the picture
- There's no light at all
- Clothes wrinkles, shades, textures, and colors are the same as real clothes
- Keep your jacket flat
- Place the outer layer naturally so that only one side is open
- The sleeves and collar are also organized using the actual texture of the fabric
- The whole structure is as orderly as it used to be
- Add adequate padding/margin around the edge
- Minimize top, bottom, left and right margins to ensure clear visibility of the product`;

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [rulebookInput, setRulebookInput] = useState(DEFAULT_RULEBOOK);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    image_url: string;
    filename: string;
    tokens?: any;
  } | null>(null);
  const [error, setError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 인증 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";");
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${COOKIE_NAME}=`)
      );

      if (authCookie) {
        setIsAuthenticated(true);
      } else {
        // 인증되지 않았으면 로그인 페이지로 이동
        router.push("/login");
      }
    }
  }, [router]);

  const validateJson = (
    jsonStr: string
  ): { valid: boolean; data?: JsonData; error?: string } => {
    try {
      if (!jsonStr.trim()) {
        return { valid: false, error: "JSON을 입력해주세요" };
      }

      // 기본 JSON 검증 (중복 키는 백엔드에서 처리)
      const data = JSON.parse(jsonStr) as JsonData;

      // products 필드 확인
      if (!data.products) {
        return { valid: false, error: "products 필드가 필요합니다" };
      }

      return { valid: true, data };
    } catch (err: any) {
      return { valid: false, error: `JSON 형식 오류: ${err.message}` };
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setJsonError("");

    // 실시간 JSON 검증 (선택사항)
    if (value.trim()) {
      const validation = validateJson(value);
      if (!validation.valid) {
        setJsonError(validation.error || "");
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setJsonError("");

    try {
      // JSON 검증
      const validation = validateJson(jsonInput);
      if (!validation.valid || !validation.data) {
        setJsonError(validation.error || "JSON 형식이 올바르지 않습니다");
        setLoading(false);
        return;
      }

      const data = validation.data;

      // 중복 키가 있을 수 있으므로 JSON 문자열을 그대로 백엔드로 전송
      // 백엔드에서 중복 키 처리
      const response = await axios.post(`${apiUrl}/api/generate`, {
        style_id: data.style_id || undefined,
        json_string: jsonInput.trim(), // 원본 JSON 문자열 전송
        custom_rulebook: rulebookInput.trim() || undefined, // 사용자 정의 rulebook 전송
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "이미지 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExample = () => {
    const example = {
      style_id: "4783",
      products: [
        {
          type: "TOP",
          sub_type: "긴팔셔츠/남방",
          image_url:
            "https://ds1l559sry31l.cloudfront.net/media/clothes/167efdf7-8daf-40c0-9773-398ef163e35a.jpg",
        },
        {
          type: "BOTTOM",
          sub_type: "슬랙스",
          image_url:
            "https://ds1l559sry31l.cloudfront.net/media/clothes/b5d9b407-fc77-43a9-9576-709b421b98ce.png",
        },
        {
          type: "SHOES",
          sub_type: "로퍼",
          image_url:
            "https://ds1l559sry31l.cloudfront.net/media/clothes/10f661ef-7b14-49a4-9756-1180e3ac3307.jpg",
        },
      ],
    };
    setJsonInput(JSON.stringify(example, null, 2));
    setJsonError("");
  };

  // 인증되지 않았으면 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null;
  }

  // 인증되지 않았으면 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎨 Flatlay Image Generator</h1>
        <p className={styles.subtitle}>
          JSON 데이터를 입력하여 AI 기반 플랫레이 이미지를 생성합니다
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>제품 정보 (JSON)</h2>
            <button
              onClick={handleLoadExample}
              className={styles.exampleButton}
            >
              예제 로드
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              JSON 데이터 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`${styles.textarea} ${
                jsonError ? styles.textareaError : ""
              }`}
              placeholder={`{"style_id":"4783","products":[{"type":"TOP","sub_type":"긴팔셔츠/남방","image_url":"https://..."},{"type":"BOTTOM","sub_type":"슬랙스","image_url":"https://..."}]}`}
              rows={6}
            />
            {jsonError && (
              <div className={styles.jsonError}>⚠️ {jsonError}</div>
            )}
            <div className={styles.jsonHint}>
              💡 <strong>지원 형식:</strong> products가 배열 또는 객체 형태 모두
              지원됩니다.
              <br />
              style_id는 선택사항이며, JSON에서 자동으로 추출됩니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rulebook 설정</h2>
            <button
              onClick={() => setRulebookInput(DEFAULT_RULEBOOK)}
              className={styles.exampleButton}
            >
              기본값으로 리셋
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Rulebook 텍스트 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={rulebookInput}
              onChange={(e) => setRulebookInput(e.target.value)}
              className={styles.textarea}
              placeholder="Rulebook을 입력하세요..."
              rows={15}
            />
            <div className={styles.jsonHint}>
              💡 <strong>Rulebook:</strong> 이미지 생성 시 적용될 규칙을
              정의합니다.
              <br />
              기본값은 현재 사용 중인 rulebook입니다. 필요에 따라 수정할 수
              있습니다.
            </div>
          </div>
        </section>

        <div className={styles.actionSection}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={styles.generateButton}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                생성 중...
              </>
            ) : (
              "✨ 이미지 생성"
            )}
          </button>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <strong>⚠️ 에러:</strong> {error}
          </div>
        )}

        {result && (
          <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}>생성 결과</h2>

            <div className={styles.resultImageContainer}>
              <img
                src={`${apiUrl}${result.image_url}`}
                alt="Generated flatlay"
                className={styles.resultImage}
              />
            </div>

            <div className={styles.resultActions}>
              <a
                href={`${apiUrl}${result.image_url}`}
                download={result.filename}
                className={styles.downloadButton}
              >
                📥 이미지 다운로드
              </a>
            </div>
            {/*             
            {result.tokens && (
              <div className={styles.tokenInfo}>
                <h3 className={styles.tokenTitle}>토큰 사용량</h3>
                <div className={styles.tokenGrid}>
                  <div className={styles.tokenItem}>
                    <span className={styles.tokenLabel}>입력 토큰</span>
                    <span className={styles.tokenValue}>
                      {result.tokens.prompt_tokens?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.tokenItem}>
                    <span className={styles.tokenLabel}>출력 토큰</span>
                    <span className={styles.tokenValue}>
                      {result.tokens.candidates_tokens?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.tokenItem}>
                    <span className={styles.tokenLabel}>총 토큰</span>
                    <span className={styles.tokenValue}>
                      {result.tokens.total_tokens?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.tokenItem}>
                    <span className={styles.tokenLabel}>예상 비용</span>
                    <span className={styles.tokenValue}>
                      ${result.tokens.estimated_cost_usd || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            )} */}
          </section>
        )}
      </main>
    </div>
  );
}
