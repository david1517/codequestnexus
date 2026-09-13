import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { CSSProperties } from 'react';

import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';

export function Feedback() {
  const { user } = useAuthStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setRating(0);
      setComment('');
      setLoaded(false);
      return;
    }

    let cancelled = false;

    const loadFeedback = async () => {
      setLoaded(false);

      try {
        if (!db) {
          throw new Error('Firebase Firestore não está configurado.');
        }

        const feedbackRef = doc(
          db,
          'platformRatings',
          user.id
        );

        const snapshot = await getDoc(feedbackRef);

        if (cancelled) {
          return;
        }

        if (snapshot.exists()) {
          const data = snapshot.data();

          setRating(
            typeof data.rating === 'number'
              ? Math.min(5, Math.max(0, data.rating))
              : 0
          );

          setComment(
            typeof data.comment === 'string'
              ? data.comment
              : ''
          );
        } else {
          setRating(0);
          setComment('');
        }

        setLoaded(true);
      } catch (error) {
        console.error(
          'Erro ao carregar feedback do Firebase:',
          error
        );

        if (!cancelled) {
          setMessage(
            'Não foi possível carregar seu feedback do Firebase.'
          );

          setLoaded(true);
        }
      }
    };

    void loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const saveFeedback = async () => {
    if (!user?.id) {
      setMessage('Faça login para enviar seu feedback.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }

    if (!db) {
      setMessage(
        'Firebase Firestore não está configurado.'
      );
      return;
    }

    setSaving(true);
    setMessage('');

    const cleanComment = comment.trim().slice(0, 1000);

    try {
      const feedbackRef = doc(
        db,
        'platformRatings',
        user.id
      );

      const existing = await getDoc(feedbackRef);

      const feedbackData = {
        userId: user.id,
        username: user.username || 'Usuário',
        role:
          typeof user.role === 'string'
            ? user.role
            : 'student',
        rating,
        comment: cleanComment,
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        feedbackRef,
        existing.exists()
          ? feedbackData
          : {
              ...feedbackData,
              createdAt: serverTimestamp(),
            },
        { merge: true }
      );

      // Limpa o formulário depois que o Firebase confirmou o salvamento.
      setRating(0);
      setComment('');

      setMessage(
        '⭐ Feedback enviado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao salvar feedback no Firebase:',
        error
      );

      setMessage(
        '❌ Não foi possível salvar o feedback no Firebase.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.center}>
        <p>Carregando feedback...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              CODEQUEST NEXUS
            </p>

            <h1 style={styles.title}>
              💬 Feedback
            </h1>

            <p style={styles.subtitle}>
              Conte para nós como está sendo sua
              experiência na plataforma.
            </p>
          </div>

          <div style={styles.headerIcon}>
            💙
          </div>
        </div>

        <section style={styles.card}>
          {!loaded ? (
            <p style={styles.loading}>
              Carregando seu feedback...
            </p>
          ) : (
            <>
              <h2 style={styles.sectionTitle}>
                Como você avalia o CodeQuest Nexus?
              </h2>

              <p style={styles.description}>
                Sua opinião ajuda a melhorar a plataforma.
              </p>

              <div style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Avaliar com ${star} estrela${
                      star > 1 ? 's' : ''
                    }`}
                    onClick={() => {
                      setRating(star);
                      setMessage('');
                    }}
                    style={{
                      ...styles.starButton,
                      transform:
                        star === rating
                          ? 'scale(1.1)'
                          : 'scale(1)',
                    }}
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <p style={styles.selectedRating}>
                {rating > 0
                  ? `${rating} de 5 estrelas`
                  : 'Escolha uma nota'}
              </p>

              <label style={styles.label}>
                Comentário
              </label>

              <textarea
                value={comment}
                onChange={(event) => {
                  setComment(
                    event.target.value.slice(0, 1000)
                  );
                  setMessage('');
                }}
                placeholder="Quer deixar um comentário? Conte o que você achou..."
                maxLength={1000}
                style={styles.textarea}
              />

              <div style={styles.footer}>
                <span style={styles.counter}>
                  {comment.length}/1000
                </span>

                <button
                  type="button"
                  onClick={saveFeedback}
                  disabled={
                    saving || rating < 1
                  }
                  style={{
                    ...styles.button,
                    opacity:
                      saving || rating < 1
                        ? 0.55
                        : 1,
                    cursor:
                      saving || rating < 1
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {saving
                    ? 'Enviando...'
                    : '⭐ Enviar feedback'}
                </button>
              </div>

              {message && (
                <p
                  style={{
                    ...styles.message,
                    color: message.startsWith('⭐')
                      ? '#00FF88'
                      : '#F59E0B',
                  }}
                >
                  {message}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '35px',
    boxSizing: 'border-box',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
  },

  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },

  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '25px',
  },

  eyebrow: {
    color: '#00D4FF',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    margin: '0 0 8px',
  },

  title: {
    fontSize: '32px',
    margin: 0,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: '14px',
    marginTop: '10px',
    marginBottom: 0,
  },

  headerIcon: {
    fontSize: '45px',
  },

  card: {
    background: '#111827',
    border: '1px solid #8B5CF640',
    borderRadius: '12px',
    padding: '30px',
    boxShadow:
      '0 0 30px rgba(139,92,246,0.08)',
  },

  loading: {
    color: '#9CA3AF',
    margin: 0,
  },

  sectionTitle: {
    fontSize: '21px',
    margin: 0,
  },

  description: {
    color: '#9CA3AF',
    fontSize: '14px',
    marginTop: '8px',
  },

  stars: {
    display: 'flex',
    gap: '5px',
    marginTop: '25px',
  },

  starButton: {
    background: 'transparent',
    border: 'none',
    color: '#FFD700',
    padding: '0 4px',
    fontSize: '48px',
    lineHeight: 1,
    cursor: 'pointer',
    transition:
      'transform 0.15s ease',
  },

  selectedRating: {
    color: '#D1D5DB',
    fontSize: '13px',
    marginTop: '10px',
    marginBottom: '25px',
  },

  label: {
    display: 'block',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },

  textarea: {
    width: '100%',
    minHeight: '150px',
    boxSizing: 'border-box',
    resize: 'vertical',
    background: '#0A1020',
    color: '#FFFFFF',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '14px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    outline: 'none',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },

  counter: {
    color: '#6B7280',
    fontSize: '11px',
  },

  button: {
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    background:
      'linear-gradient(90deg, #8B5CF6, #6366F1)',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '13px',
  },

  message: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: 0,
  },
};