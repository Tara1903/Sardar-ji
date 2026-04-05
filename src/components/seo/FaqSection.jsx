export const FaqSection = ({ eyebrow = 'FAQs', questions = [], title }) => {
  if (!questions.length) {
    return null;
  }

  return (
    <section className="section faq-section">
      <div className="container">
        <div className="panel-card faq-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2>{title}</h2>
            </div>
          </div>

          <div className="faq-list">
            {questions.map((entry) => (
              <article className="faq-item" key={entry.question}>
                <h3>{entry.question}</h3>
                <p>{entry.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
