# Eigener Container: Piper steht unter GPL und bleibt so von der App getrennt.
FROM python:3.13-slim
ARG VOICE=de_DE-thorsten-high
ENV VOICE=${VOICE}
RUN pip install --no-cache-dir "piper-tts[http]==1.8.0" \
 && mkdir /voices \
 && python -m piper.download_voices --data-dir /voices ${VOICE}
USER nobody
EXPOSE 5000
CMD ["sh", "-c", "exec python -m piper.http_server -m \"$VOICE\" --data-dir /voices --host 0.0.0.0 --port 5000"]
