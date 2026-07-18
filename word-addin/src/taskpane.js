let hasSelection = false;

Office.onReady(function () {
  document.getElementById("send-btn").addEventListener("click", sendToGemini);
  document.getElementById("replace-btn").addEventListener("click", replaceSelection);
  document.getElementById("insert-end-btn").addEventListener("click", insertAtEnd);
  document.getElementById("paste-area").addEventListener("input", onPasteAreaChange);
});

function onPasteAreaChange() {
  const hasContent = document.getElementById("paste-area").value.trim().length > 0;
  document.getElementById("replace-btn").disabled = !hasContent;
}

async function sendToGemini() {
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load("text");
      await context.sync();

      const text = selection.text;
      if (!text || !text.trim()) {
        showStatus("Select some text in your document first.", "error");
        return;
      }

      hasSelection = true;

      const instruction = document.getElementById("instruction").value.trim();
      const clipboardText = instruction
        ? instruction + ":\n\n" + text
        : text;

      await navigator.clipboard.writeText(clipboardText);

      const preview = document.getElementById("selection-preview");
      preview.textContent = text.length > 100 ? text.substring(0, 100) + "..." : text;
      preview.style.display = "block";

      window.open("https://gemini.google.com", "_blank");
      showStatus("Text copied! Paste it into Gemini, get the response, then paste it back here.", "info");
    });
  } catch (err) {
    showStatus("Error: " + err.message, "error");
  }
}

async function replaceSelection() {
  const text = document.getElementById("paste-area").value.trim();
  if (!text) {
    showStatus("Paste Gemini's response first.", "error");
    return;
  }

  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertText(text, Word.InsertLocation.replace);
      await context.sync();
    });

    showStatus("Done! Selection replaced with Gemini's response.", "success");
    document.getElementById("paste-area").value = "";
    document.getElementById("replace-btn").disabled = true;
    document.getElementById("selection-preview").style.display = "none";
    hasSelection = false;
  } catch (err) {
    showStatus("Replace failed: " + err.message, "error");
  }
}

async function insertAtEnd() {
  const text = document.getElementById("paste-area").value.trim();
  if (!text) {
    showStatus("Paste Gemini's response first.", "error");
    return;
  }

  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      const paragraphs = text.split("\n\n");
      for (const para of paragraphs) {
        if (para.trim()) {
          body.insertParagraph(para.trim(), Word.InsertLocation.end);
        }
      }
      await context.sync();
    });

    showStatus("Content inserted at end of document!", "success");
    document.getElementById("paste-area").value = "";
    document.getElementById("replace-btn").disabled = true;
  } catch (err) {
    showStatus("Insert failed: " + err.message, "error");
  }
}

function showStatus(message, type) {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = type;
}
