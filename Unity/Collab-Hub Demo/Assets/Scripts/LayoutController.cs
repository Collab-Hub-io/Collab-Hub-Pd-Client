using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;

public class LayoutController : MonoBehaviour
{
    public float outSpacing, inSpacing;

    public float handWorkingSpacePercent = 80;
    public float squeezeSpacePercent = 40;
    
    // make this private soon
    public float percent;
    
    public List<LayoutElement> LayoutElements;

    public HorizontalLayoutGroup layoutGroup;

    public int spacingOffset;

    private int lastCardCount;

    public int defaultSpacing;

    private void Awake()
    {
        layoutGroup = GetComponent<HorizontalLayoutGroup>();
        layoutGroup.spacing = defaultSpacing;
    }

    // Start is called before the first frame update
    void Start()
    {
        // print("spacing? "+ layoutGroup.spacing);
        percent = handWorkingSpacePercent;
    }

    private void Update()
    {
        LayoutElements = GetComponentsInChildren<LayoutElement>().Where(element => element.ignoreLayout == false).ToList();
        
        if (LayoutElements.Count > 0 && lastCardCount != LayoutElements.Count)
        {
            adjustSpacing();
        }
        
        lastCardCount = LayoutElements.Count;
    }

    private void adjustSpacing()
    {
        var cardCount = LayoutElements.Count;
        var handAreaWidth = GetComponent<RectTransform>().rect.width;
        var workingArea = handAreaWidth * (percent/100f);
        var cardWidth = LayoutElements[0].GetComponent<RectTransform>().rect.width;
        var totalCardWidth = (cardCount * cardWidth) + (.5f * cardWidth);
            
        // print("Card width: " + cardWidth);
        // print("working area: " + workingArea);
        if (totalCardWidth > workingArea)
        {
            // print("setting layoutspacing to: " + (totalCardWidth - workingArea) / (cardCount - 1) * -1);
            layoutGroup.spacing = (totalCardWidth - workingArea) / cardCount * -1;
        }
        else
        {
            layoutGroup.spacing = defaultSpacing;
        }
    }

    public void fanOut()
    {
        // print("fanning out dropzone cards");
        // layoutGroup.spacing = outSpacing;
        percent = handWorkingSpacePercent;
        adjustSpacing();
    }

    public void squeezeIn()
    {
        // LayoutElements
        // print("squeezing in dropzone cards");
        // layoutGroup.spacing = inSpacing;
        percent = squeezeSpacePercent;
        adjustSpacing();
    }

    int getNumberOfLayoutElements()
    {
        LayoutElements = GetComponentsInChildren<LayoutElement>().Where(element => element.ignoreLayout == false).ToList();
        return LayoutElements.Count;
    }
    
}
