<?php

/**
 * This file contains QUI\PresentationBricks\Controls\StickyContent
 */

namespace QUI\PresentationBricks\Controls;

use QUI;
use QUI\Projects\Site\Utils;

/**
 * Class StickyContent
 *
 * @package quiqqer/presentation-bricks
 */
class StickyContent extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'class'           => 'qui-control-brick',
            'limit'           => 4,
            'order'           => 'c_date DESC',
            'parentInputList' => false,

        ));

        parent::__construct($attributes);

        $this->setAttribute(
            'qui-class',
            'package/quiqqer/presentation-bricks/bin/Controls/StickyContent'
        );

    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $start   = 0;
        $limit   = $this->getAttribute('limit');
        $Project = $this->getProject();


        if (!$limit) {
            $limit = 3;
        }

        $children = Utils::getSitesByInputList($Project, $this->getAttribute('site'), array(
            'where' => $this->getAttribute('where'),
            'limit' => $start . ',' . $limit,
            'order' => $this->getAttribute('order')
        ));


        $Engine->assign(array(
            'this'        => $this,
            'Site'        => $this->getSite(),
            'Project'     => $this->getProject(),
            'children'    => $children,
            'inlineStyle' => 'opacity: 1;'
        ));

        $this->addCSSFile(dirname(__FILE__) . '/StickyContent.css');
        return $Engine->fetch(dirname(__FILE__) . '/StickyContent.html');
    }

    /**
     * Check if the limit can execute
     *
     * @throws QUI\Exception
     */
    public function checkLimit()
    {
        $Site = $this->getSite();

        if (!$Site) {
            return;
        }

        $sheet = 1;
        $limit = $this->getAttribute('limit');

        if (!$limit) {
            $limit = 2;
        }

        if (isset($_REQUEST['sheet'])) {
            $sheet = (int)$_REQUEST['sheet'];
        }

        $count_children = $Site->getChildren(array(
            'count' => 'count'
        ));

        $sheets = ceil($count_children / $limit);

        if ($sheets < $sheet || $sheet < 0) {
            throw new QUI\Exception('Sites not found', 404);
        }
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
