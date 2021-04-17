using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class WaitingTextAnim : MonoBehaviour
{
    public bool animate;

    TextMeshProUGUI myText;
    int maxCount;
    int currentCount;

    private void OnEnable()
    {
        myText = GetComponent<TextMeshProUGUI>();
        if (animate) AnimateText();
    }

    public void AnimateText()
    {
        animate = true;
        maxCount = myText.text.Length;
        currentCount = maxCount - 3;
        myText.maxVisibleCharacters = currentCount;
        StartCoroutine(TextAnimation());
    }

    public void UnanimateText()
    {
        animate = false;
        myText.maxVisibleCharacters = 1000;
    }

    IEnumerator TextAnimation()
    {
        yield return new WaitForSeconds(0.5F);

        if(maxCount == currentCount) currentCount -= 3;
        else currentCount++;
        myText.maxVisibleCharacters = currentCount;

        if (animate && gameObject.activeInHierarchy) StartCoroutine(TextAnimation());
        else myText.maxVisibleCharacters = 1000;
    }
}
