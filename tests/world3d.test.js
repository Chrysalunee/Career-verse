.world3d-button {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 30;
  background: linear-gradient(135deg, #38b78b, #2f6d61);
  color: #fff;
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1.2rem;
  font-weight: 800;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

#careerverse-world3d-stage {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: none;
  padding: 1rem;
  background: rgba(3, 7, 8, 0.8);
}

.world3d-shell {
  max-width: 1100px;
  margin: 0 auto;
  background: #0d1b15;
  border: 1px solid #5c7a69;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.world3d-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(146, 184, 170, 0.4);
}

.world3d-header h2 {
  margin: 0.25rem 0 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.world3d-close {
  background: #182e27;
  color: #fff;
  border: 1px solid #739984;
  border-radius: 10px;
  padding: 0.65rem 1rem;
  cursor: pointer;
}

.world3d-view {
  width: 100%;
  height: min(68vh, 620px);
  background: linear-gradient(180deg, #0c1920, #142b25);
}

.world3d-label {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(228, 234, 222, 0.7);
  color: #fff;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.world3d-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
  padding: 0.9rem 1.2rem 1.2rem;
  color: #dcebe0;
}

.world3d-meta p {
  margin: 0;
}
