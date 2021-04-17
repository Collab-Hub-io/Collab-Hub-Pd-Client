using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class QuittingGame : MonoBehaviour
{
    public GameObject warningPanel;
    public Button quitButton;

    public void openQuitWarning(bool open)
    {
        warningPanel.SetActive(open);
        StartCoroutine(DelayInteraction(open));
    }

    public void quitCurrentGame()
    {
        // tell the server that I am quitting and not coming back
        UnityEngine.SceneManagement.SceneManager.LoadScene(0);
    }

    IEnumerator DelayInteraction(bool enable)
    {
        if (enable) yield return new WaitForSeconds(1F);
        else yield return new WaitForSeconds(0.1F);

        quitButton.interactable = enable;
    }
}
